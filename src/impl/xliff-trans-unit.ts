import {DOMParser, XMLSerializer} from "xmldom";
import {isNullOrUndefined, format, isString} from 'util';
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {ITransUnit} from '../api/i-trans-unit';
import * as Constants from '../api/constants';
import {DOMUtilities} from './dom-utilities';
import {INormalizedMessage} from '../api/i-normalized-message';
import {AbstractTransUnit} from './abstract-trans-unit';
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XLIFF 1.2 file.
 */

export class XliffTransUnit extends AbstractTransUnit implements ITransUnit {

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
        // TODO
        let directHtml = this.targetContent();
        if (!directHtml) {
            return null;
        }
        let normalized = directHtml;
        let re0: RegExp = /<x id="INTERPOLATION"><\/x>/g;
        normalized = normalized.replace(re0, '{{0}}');
        let re0b: RegExp = /<x id="INTERPOLATION"\/>/g;
        normalized = normalized.replace(re0b, '{{0}}');
        let reN: RegExp = /<x id="INTERPOLATION_(\d*)"><\/x>/g;
        normalized = normalized.replace(reN, '{{$1}}');
        let reNb: RegExp = /<x id="INTERPOLATION_(\d*)"\/>/g;
        normalized = normalized.replace(reNb, '{{$1}}');

        let reStartBold: RegExp = /<x id="START_BOLD_TEXT" ctype="x-b"><\/x>/g;
        normalized = normalized.replace(reStartBold, '<b>');
        let reStartBoldb: RegExp = /<x id="START_BOLD_TEXT" ctype="x-b"\/>/g;
        normalized = normalized.replace(reStartBoldb, '<b>');
        let reCloseBold: RegExp = /<x id="CLOSE_BOLD_TEXT" ctype="x-b"><\/x>/g;
        normalized = normalized.replace(reCloseBold, '</b>');
        let reCloseBoldb: RegExp = /<x id="CLOSE_BOLD_TEXT" ctype="x-b"\/>/g;
        normalized = normalized.replace(reCloseBoldb, '</b>');

        let reStartAnyTag: RegExp = /<x id="START_TAG_(\w*)" ctype="x-(\w*)"><\/x>/g;
        normalized = normalized.replace(reStartAnyTag, '<$2>');
        let reStartAnyTagb: RegExp = /<x id="START_TAG_(\w*)" ctype="x-(\w*)"\/>/g;
        normalized = normalized.replace(reStartAnyTagb, '<$2>');
        let reCloseAnyTag: RegExp = /<x id="CLOSE_TAG_(\w*)" ctype="x-(\w*)"><\/x>/g;
        normalized = normalized.replace(reCloseAnyTag, '</$2>');
        let reCloseAnyTagb: RegExp = /<x id="CLOSE_TAG_(\w*)" ctype="x-(\w*)"\/>/g;
        normalized = normalized.replace(reCloseAnyTagb, '</$2>');

        //return normalized;
        return null;
    }

    /**
     * State of the translation as stored in the xml.
     */
    public nativeTargetState(): string {
        let targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (targetElement) {
            return targetElement.getAttribute('state');
        } else {
            return null;
        }
    }

    /**
     * set state in xml.
     * @param nativeState
     */
    protected setNativeTargetState(nativeState: string) {
        let targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (targetElement) {
            targetElement.setAttribute('state', nativeState);
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
                return 'new';
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
            case 'new':
                return Constants.STATE_NEW;
            case 'needs-translation':
                return Constants.STATE_NEW;
            case 'translated':
                return Constants.STATE_TRANSLATED;
            case 'needs-adaptation':
                return Constants.STATE_TRANSLATED;
            case 'needs-l10n':
                return Constants.STATE_TRANSLATED;
            case 'needs-review-adaptation':
                return Constants.STATE_TRANSLATED;
            case 'needs-review-l10n':
                return Constants.STATE_TRANSLATED;
            case 'needs-review-translation':
                return Constants.STATE_TRANSLATED;
            case 'final':
                return Constants.STATE_FINAL;
            case 'signed-off':
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
        let sourceElements = this._element.getElementsByTagName('context-group');
        let sourceRefs: { sourcefile: string, linenumber }[] = [];
        for (let i = 0; i < sourceElements.length; i++) {
            const elem = sourceElements.item(i);
            if (elem.getAttribute('purpose') === 'location') {
                let contextElements = elem.getElementsByTagName('context');
                let sourcefile = null;
                let linenumber = 0;
                for (let j = 0; j < contextElements.length; j++) {
                    const contextElem = contextElements.item(j);
                    if (contextElem.getAttribute('context-type') === 'sourcefile') {
                        sourcefile = DOMUtilities.getPCDATA(contextElem);
                    }
                    if (contextElem.getAttribute('context-type') === 'linenumber') {
                        linenumber = Number.parseInt(DOMUtilities.getPCDATA(contextElem));
                    }
                };
                sourceRefs.push({sourcefile: sourcefile, linenumber: linenumber});
            }
        }
        return sourceRefs;
    }

    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xliff this is stored as a note element with attribute from="description".
     */
    public description(): string {
        let noteElements = this._element.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('from') === 'description') {
                return DOMUtilities.getPCDATA(noteElem);
            }
        }
        return null;
    }

    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xliff this is stored as a note element with attribute from="meaning".
     */
    public meaning(): string {
        let noteElements = this._element.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('from') === 'meaning') {
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
        // TODO support normalized message
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            let source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            target = source.parentElement.appendChild(this._element.ownerDocument.createElement('target'));
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
            target = source.parentElement.appendChild(this._element.ownerDocument.createElement('target'));
        }
        if (isDefaultLang || copyContent) {
            DOMUtilities.replaceContentWithPCDATA(target, DOMUtilities.getPCDATA(source));
        } else {
            DOMUtilities.replaceContentWithPCDATA(target, '');
        }
        if (isDefaultLang) {
            target.setAttribute('state', 'final');
        } else {
            target.setAttribute('state', 'new');
        }
    }

}
