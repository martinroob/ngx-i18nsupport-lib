import {DOMParser, XMLSerializer} from "xmldom";
import {isNullOrUndefined, format, isString} from 'util';
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {ITransUnit} from '../api/i-trans-unit';
import * as Constants from '../api/constants';
import {DOMUtilities} from './dom-utilities';
import {ParsedMessage} from './parsed-message';
import {INormalizedMessage} from '../api/i-normalized-message';
import {AbstractTransUnit} from './abstract-trans-unit';
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
        return DOMUtilities.getPCDATA(sourceElement);
    }

    /**
     * The original text value, that is to be translated, as normalized message.
     */
    public sourceContentNormalized(): INormalizedMessage {
        // TODO
        return null;
    }

    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    public targetContent(): string {
        let targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return DOMUtilities.getPCDATA(targetElement);
    }

    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized(): INormalizedMessage {
        let parsedMessage: ParsedMessage = this.parseTargetContent();
        return parsedMessage;

    }

    private parseTargetContent(): ParsedMessage {
        return this.parseAsMessage(DOMUtilities.getFirstElementByTagName(this._element, 'target'));
    }

    private parseAsMessage(messageElem: Element): ParsedMessage {
        let message: ParsedMessage = new ParsedMessage();
        if (messageElem) {
            this.addPartsOfNodeToMessage(messageElem, message, false);
        }
        return message;
    }

    private addPartsOfNodeToMessage(node: Node, message: ParsedMessage, includeSelf: boolean) {
        if (includeSelf) {
            if (node.nodeType === node.TEXT_NODE) {
                message.addText(node.textContent);
                return;
            }
            if (node.nodeType === node.ELEMENT_NODE) {
                let elementNode: Element = <Element> node;
                let tagName = elementNode.tagName;
                if (tagName === 'ph') {
                    // placeholder are like <ph id="0" equiv="INTERPOLATION" disp="{{number()}}"/>
                    // They contain the id and also a name (number in the example)
                    // TODO make some use of the name (but it is not available in XLIFF 1.2)
                    let equiv = elementNode.getAttribute('equiv');
                    let indexString = '';
                    if (!equiv || !equiv.startsWith('INTERPOLATION')) {
                        indexString = elementNode.getAttribute('id')
                    } else {
                        if (equiv === 'INTERPOLATION') {
                            indexString = '0';
                        } else {
                            indexString = equiv.substring('INTERPOLATION_'.length);
                        }
                    }
                    let index = Number.parseInt(indexString);
                    message.addPlaceholder(index);
                    return;
                } else if (tagName === 'pc') {
                    // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
                    let embeddedTagName = this.tagNameFromPCElement(elementNode);
                    if (embeddedTagName) {
                        message.addOpenTag(embeddedTagName);
                        this.addPartsOfNodeToMessage(elementNode, message, false);
                        message.addCloseTag(embeddedTagName);
                    } else {
                        this.addPartsOfNodeToMessage(elementNode, message, false);
                    }
                    return;
                }
            }
        }
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
            this.addPartsOfNodeToMessage(children.item(i), message, true);
        }
    }

    private tagNameFromPCElement(pcNode: Element): string {
        let dispStart = pcNode.getAttribute('dispStart');
        if (dispStart.startsWith('<')) {
            dispStart = dispStart.substring(1);
        }
        if (dispStart.endsWith('>')) {
            dispStart = dispStart.substring(0, dispStart.length - 1);
        }
        return dispStart;
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
            case Constants.STATE_NEW:
                return 'initial';
            case Constants.STATE_TRANSLATED:
                return 'translated';
            case Constants.STATE_FINAL:
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
                return Constants.STATE_NEW;
            case 'translated':
                return Constants.STATE_TRANSLATED;
            case 'reviewed': // same as translated
                return Constants.STATE_TRANSLATED;
            case 'final':
                return Constants.STATE_FINAL;
            default:
                return null;
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
     * Translate the trans unit.
     * @param translation the translated string or (preferred) a normalized message.
     * The pure string can contain any markup and will not be checked.
     * So it can damage the document.
     * A normalized message prevents this.
     */
    public translate(translation: string | INormalizedMessage) {
        // TODO support normalizedMessage
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            let source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
        }
        if (isString(translation)) {
            DOMUtilities.replaceContentWithPCDATA(target, <string> translation);
        } else {
            // TODO
        }
        this.setTargetState(Constants.STATE_TRANSLATED);
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
            DOMUtilities.replaceContentWithPCDATA(target, DOMUtilities.getPCDATA(source));
        } else {
            DOMUtilities.replaceContentWithPCDATA(target, '');
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
