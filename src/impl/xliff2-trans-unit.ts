import {DOMParser, XMLSerializer} from "xmldom";
import {isNullOrUndefined, format, isString} from 'util';
import {ITranslationMessagesFile, ITransUnit, STATE_NEW, STATE_TRANSLATED, STATE_FINAL} from '../api';
import {DOMUtilities} from './dom-utilities';
import {ParsedMessage} from './parsed-message';
import {INormalizedMessage} from '../api/i-normalized-message';
import {AbstractTransUnit} from './abstract-trans-unit';
import {Xliff2MessageParser} from './xliff2-message-parser';
import {FORMAT_XLIFF20} from '../api/constants';
import {MessageParserFactory} from './message-parser-factory';
/**
 * Created by martin on 04.05.2017.
 * A Translation Unit in an XLIFF 2.0 file.
 */

export class Xliff2TransUnit extends AbstractTransUnit  implements ITransUnit {

    constructor(_element: Element, _id: string,_translationMessagesFile: ITranslationMessagesFile) {
        super(_element, _id, _translationMessagesFile);
    }

    public sourceContent(): string {
        const sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        return DOMUtilities.getXMLContent(sourceElement);
    }

    /**
     * The original text value, that is to be translated, as normalized message.
     */
    public createSourceContentNormalized(): INormalizedMessage {
        const sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        if (sourceElement) {
            return MessageParserFactory.parserForFormat(FORMAT_XLIFF20).parseElement(sourceElement);
        } else {
            return null;
        }
    }

    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    public targetContent(): string {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return DOMUtilities.getXMLContent(targetElement);
    }

    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized(): INormalizedMessage {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return new Xliff2MessageParser().parseElement(targetElement);
    }

    /**
     * State of the translation as stored in the xml.
     */
    public nativeTargetState(): string {
        let segmentElement = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
        if (segmentElement) {
            return segmentElement.getAttribute('state');
        } else {
            return null;
        }
    }

    /**
     * set state in xml.
     * @param nativeState
     */
    protected setNativeTargetState(nativeState: string) {
        let segmentElement = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
        if (segmentElement) {
            segmentElement.setAttribute('state', nativeState);
        }
    }

    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    protected mapStateToNativeState(state: string): string {
        switch( state) {
            case STATE_NEW:
                return 'initial';
            case STATE_TRANSLATED:
                return 'translated';
            case STATE_FINAL:
                return 'final';
            default:
                throw new Error('unknown state ' +  state);
        }
    }

    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState
     */
    protected mapNativeStateToState(nativeState: string): string {
        switch( nativeState) {
            case 'initial':
                return STATE_NEW;
            case 'translated':
                return STATE_TRANSLATED;
            case 'reviewed': // same as translated
                return STATE_TRANSLATED;
            case 'final':
                return STATE_FINAL;
            default:
                return STATE_NEW;
        }
    }

    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    public sourceReferences(): {sourcefile: string, linenumber}[] {
        // TODO in the moment there is no source ref written in XLIFF 2.0
        // so this code is just a guess, expect source as <file>:<line> in <note category="location">...
        let noteElements = this._element.getElementsByTagName('note');
        let sourceRefs: { sourcefile: string, linenumber }[] = [];
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('category') === 'location') {
                let source = DOMUtilities.getPCDATA(noteElem);
                let sourcefile = source; // TODO parse it, wait for concrete syntax here
                let linenumber = 0;
                sourceRefs.push({sourcefile: sourcefile, linenumber: linenumber});
            }
        }
        return sourceRefs;
    }

    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xliff 2.0 this is stored as a note element with attribute category="description".
     */
    public description(): string {
        let noteElements = this._element.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('category') === 'description') {
                return DOMUtilities.getPCDATA(noteElem);
            }
        }
        return null;
    }

    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xliff 2.0 this is stored as a note element with attribute category="meaning".
     */
    public meaning(): string {
        let noteElements = this._element.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('category') === 'meaning') {
                return DOMUtilities.getPCDATA(noteElem);
            }
        }
        return null;
    }

    /**
     * Set the translation to a given string (including markup).
     * @param translation
     */
    protected translateNative(translation: string) {
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            let source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
        }
        DOMUtilities.replaceContentWithXMLContent(target, <string> translation);
        this.setTargetState(STATE_TRANSLATED);
    }

    /**
     * Copy source to target to use it as dummy translation.
     * (better than missing value)
     */
    public useSourceAsTarget(isDefaultLang: boolean, copyContent: boolean) {
        let source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
        }
        if (isDefaultLang || copyContent) {
            DOMUtilities.replaceContentWithXMLContent(target, DOMUtilities.getXMLContent(source));
        } else {
            DOMUtilities.replaceContentWithXMLContent(target, '');
        }
        let segment = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
        if (segment) {
            if (isDefaultLang) {
                segment.setAttribute('state', 'final');
            } else {
                segment.setAttribute('state', 'new');
            }
        }
    }

}
