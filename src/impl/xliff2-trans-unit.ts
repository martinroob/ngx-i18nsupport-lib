import {DOMParser, XMLSerializer} from "xmldom";
import {isNullOrUndefined, format} from 'util';
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {ITransUnit} from '../api/i-trans-unit';
import {DOMUtilities} from './dom-utilities';
import {ParsedMessage} from './parsed-message';
/**
 * Created by martin on 04.05.2017.
 * A Translation Unit in an XLIFF 2.0 file.
 */

export class Xliff2TransUnit implements ITransUnit {

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
        let parsedMessage: ParsedMessage = this.parseTargetContent();
        return parsedMessage.asDisplayString();

    }

    private parseTargetContent(): ParsedMessage {
        return this.parseAsMessage(DOMUtilities.getFirstElementByTagName(this._transUnit, 'target'));
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
                    let index = Number.parseInt(elementNode.getAttribute('id'));
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
     * State of the translation.
     * (new, final, ...)
     */
    public targetState(): string {
        let segmentElement = DOMUtilities.getFirstElementByTagName(this._transUnit, 'segment');
        if (segmentElement) {
            return segmentElement.getAttribute('state');
            // TODO mapping from XLIFF 2.0 state (initial, translated, reviewed, final) to some abstract one
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
        // TODO in the moment there is no source ref written in XLIFF 2.0
        // so this code is just a guess, expect source as <file>:<line> in <note category="location">...
        let noteElements = this._transUnit.getElementsByTagName('note');
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
        let noteElements = this._transUnit.getElementsByTagName('note');
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
        let noteElements = this._transUnit.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('category') === 'meaning') {
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
        let segment = DOMUtilities.getFirstElementByTagName(this._transUnit, 'segment');
        if (segment) {
            segment.setAttribute('state', 'final');
        }
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
        let segment = DOMUtilities.getFirstElementByTagName(this._transUnit, 'segment');
        if (segment) {
            if (isDefaultLang) {
                segment.setAttribute('state', 'final');
            } else {
                segment.setAttribute('state', 'new');
            }
        }
    }

}
