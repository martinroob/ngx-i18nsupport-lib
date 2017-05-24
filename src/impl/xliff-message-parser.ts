import {AbstractMessageParser} from './abstract-message-parser';
import {ParsedMessage} from './parsed-message';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {TagMapping} from './tag-mapping';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 1.2
 */
export class XliffMessageParser extends AbstractMessageParser {

    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    protected processStartElement(elementNode: Element, message: ParsedMessage): boolean {
        const tagName = elementNode.tagName;
        const tagMapping = new TagMapping();
        if (tagName === 'x') {
            // placeholder are like <x id="INTERPOLATION"/> or <x id="INTERPOLATION_1">
            let id = elementNode.getAttribute('id');
            if (!id) {
                return; // should not happen
            }
            if (id.startsWith('INTERPOLATION')) {
                const index = this.parsePlaceholderIndexFromId(id);
                message.addPlaceholder(index);
            } else if (id.startsWith('START_')) {
                let normalizedTagName = tagMapping.getTagnameFromStartTagPlaceholderName(id);
                if (normalizedTagName) {
                    message.addStartTag(normalizedTagName);
                }
            } else if (id.startsWith('CLOSE_')) {
                let normalizedTagName = tagMapping.getTagnameFromCloseTagPlaceholderName(id);
                if (normalizedTagName) {
                    message.addEndTag(normalizedTagName);
                }
            }
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
     * @param id
     * @return {number}
     */
    private parsePlaceholderIndexFromId(id: string): number {
        let indexString = '';

        if (id === 'INTERPOLATION') {
            indexString = '0';
        } else {
            indexString = id.substring('INTERPOLATION_'.length);
        }
        return Number.parseInt(indexString);
    }

    /**
     * the xml used for start tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element, id?: number): Node {
        let xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new TagMapping();
        let idAttrib = tagMapping.getStartTagPlaceholderName(part.tagName());
        let ctypeAttrib = 'x-' + part.tagName();
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        return xElem;
    }

    /**
     * the xml used for end tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node {
        let xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new TagMapping();
        let idAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
        let ctypeAttrib = 'x-' + part.tagName();
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        return xElem;
    }

    /**
     * the xml used for placeholder in the message.
     * Returns an empty <x/>-Element with attribute id="INTERPOLATION" or id="INTERPOLATION_n"
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfPlaceholderPart(part: ParsedMessagePartPlaceholder, rootElem: Element): Node {
        let xElem = rootElem.ownerDocument.createElement('x');
        let idAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            idAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        xElem.setAttribute('id', idAttrib);
        return xElem;
    }

}
