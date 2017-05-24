import {AbstractMessageParser} from './abstract-message-parser';
import {ParsedMessage} from './parsed-message';
import {DOMUtilities} from './dom-utilities';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {TagMapping} from './tag-mapping';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XMB
 */
export class XmbMessageParser extends AbstractMessageParser {

    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    protected processStartElement(elementNode: Element, message: ParsedMessage): boolean {
        const tagName = elementNode.tagName;
        if (tagName === 'ph') {
            // placeholders are like <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph>
            // or <ph name="INTERPOLATION_1"><ex>INTERPOLATION_1</ex></ph>
            let name = elementNode.getAttribute('name');
            if (!name) {
                return; // should not happen
            }
            if (name.startsWith('INTERPOLATION')) {
                const index = this.parsePlaceholderIndexFromName(name);
                message.addPlaceholder(index);
                return false; // ignore children
            } else if (name.startsWith('START_')) {
                const tag = this.parseTagnameFromPhElement(elementNode);
                if (tag) {
                    message.addStartTag(tag);
                }
                return false; // ignore children
            } else if (name.startsWith('CLOSE_')) {
                const tag = this.parseTagnameFromPhElement(elementNode);
                if (tag) {
                    message.addEndTag(tag);
                }
                return false; // ignore children
            }
        } else if (tagName === 'source') {
            // ignore source
            return false;
        }
        return true;
    }

    /**
     * Handle end of this element node.
     * This is called after all children are processed.
     * @param elementNode
     * @param message message to be altered
     */
    protected processEndElement(elementNode: Element, message: ParsedMessage) {
    }

    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param name
     * @return {number}
     */
    private parsePlaceholderIndexFromName(name: string): number {
        let indexString = '';

        if (name === 'INTERPOLATION') {
            indexString = '0';
        } else {
            indexString = name.substring('INTERPOLATION_'.length);
        }
        return Number.parseInt(indexString);
    }

    /**
     * Parse the tag name from a ph element.
     * It contained in the <ex> subelements value and enclosed in <>.
     * Example: <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>
     * @param phElement
     */
    private parseTagnameFromPhElement(phElement: Element): string {
        const exElement = DOMUtilities.getFirstElementByTagName(phElement, 'ex');
        if (exElement) {
            const value = DOMUtilities.getPCDATA(exElement);
            if (!value || !value.startsWith('<') || !value.endsWith('>')) {
                // oops
                return null;
            }
            if (value.charAt(1) === '/') {
                return value.substring(2, value.length - 1);
            } else {
                return value.substring(1, value.length - 1);
            }
        } else {
            return null;
        }
    }

    /**
     * the xml used for start tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element, id?: number): Node {
        let phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new TagMapping();
        let nameAttrib = tagMapping.getStartTagPlaceholderName(part.tagName());
        phElem.setAttribute('name', nameAttrib);
        let exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('<' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }

    /**
     * the xml used for end tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node {
        let phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new TagMapping();
        let nameAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
        phElem.setAttribute('name', nameAttrib);
        let exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('</' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }

    /**
     * the xml used for placeholder in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfPlaceholderPart(part: ParsedMessagePartPlaceholder, rootElem: Element): Node {
        let phElem = rootElem.ownerDocument.createElement('ph');
        let nameAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            nameAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        phElem.setAttribute('name', nameAttrib);
        let exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode(nameAttrib));
        phElem.appendChild(exElem);
        return phElem;
    }

}
