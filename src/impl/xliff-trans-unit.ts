import {DOMParser, XMLSerializer} from "xmldom";
import {isNullOrUndefined, format} from 'util';
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {ITransUnit} from '../api/i-trans-unit';
import {DOMUtilities} from './dom-utilities';
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XLIFF 1.2 file.
 */

export class XliffTransUnit implements ITransUnit {

    constructor(private _transUnit: Element, private _id: string) {

    }

    public get id(): string {
        return this._id;
    }

    public sourceContent(): string {
        const sourceElement = DOMUtilities.getFirstElementByTagName(this._transUnit, 'source');
        return DOMUtilities.getPCDATA(sourceElement);
    }

    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    public targetContent(): string {
        let targetElement = DOMUtilities.getFirstElementByTagName(this._transUnit, 'target');
        return DOMUtilities.getPCDATA(targetElement);
    }

    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized(): string {
        let directHtml = this.targetContent();
        if (!directHtml) {
            return directHtml;
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

        return normalized;
    }

    /**
     * State of the translation.
     * (new, final, ...)
     */
    public targetState(): string {
        let targetElement = DOMUtilities.getFirstElementByTagName(this._transUnit, 'target');
        if (targetElement) {
            return targetElement.getAttribute('state');
        } else {
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
        let sourceElements = this._transUnit.getElementsByTagName('context-group');
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
        let noteElements = this._transUnit.getElementsByTagName('note');
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
        let noteElements = this._transUnit.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('from') === 'meaning') {
                return DOMUtilities.getPCDATA(noteElem);
            }
        }
        return null;
    }

    /**
     * the real xml element used for trans unit.
     * Here it is a <trans-unit> element defined in XLIFF Spec.
     * @return {Element}
     */
    public asXmlElement(): Element {
        return this._transUnit;
    }

    /**
     * Translate trans unit.
     * (very simple, just for tests)
     * @param translation the translated string
     */
    public translate(translation: string) {
        let target = DOMUtilities.getFirstElementByTagName(this._transUnit, 'target');
        if (!target) {
            let source = DOMUtilities.getFirstElementByTagName(this._transUnit, 'source');
            target = source.parentElement.appendChild(this._transUnit.ownerDocument.createElement('target'));
        }
        DOMUtilities.replaceContentWithPCDATA(target, translation);
        target.setAttribute('state', 'final');
    }

    /**
     * Copy source to target to use it as dummy translation.
     * (better than missing value)
     */
    public useSourceAsTarget(isDefaultLang: boolean, copyContent: boolean) {
        let source = DOMUtilities.getFirstElementByTagName(this._transUnit, 'source');
        let target = DOMUtilities.getFirstElementByTagName(this._transUnit, 'target');
        if (!target) {
            target = source.parentElement.appendChild(this._transUnit.ownerDocument.createElement('target'));
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
