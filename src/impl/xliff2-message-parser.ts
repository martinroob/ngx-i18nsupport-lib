import {AbstractMessageParser} from './abstract-message-parser';
import {ParsedMessage} from './parsed-message';
import {FORMAT_XLIFF20} from '../api/constants';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {ParsedMessagePartText} from './parsed-message-part-text';
import {ParsedMessagePartType} from './parsed-message-part';
import {TagMapping} from './tag-mapping';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 2.0
 */
export class Xliff2MessageParser extends AbstractMessageParser {

    /**
     * Format of the translation file.
     * xmb xliff xliff2
     * Returns one of the constants FORMAT_..
     */
    public i18nFormat(): string {
        return FORMAT_XLIFF20;
    }

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
        } else if (tagName === 'pc') {
            // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
            let embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addStartTag(embeddedTagName);
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
        const tagName = elementNode.tagName;
        if (tagName === 'pc') {
            // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
            let embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addEndTag(embeddedTagName);
            }
            return;
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
     * reimplemented here, because XLIFF 2.0 uses a deeper xml model.
     * So we cannot simply replace the message parts by xml parts.
     * @param message
     * @param rootElem
     */
    protected addXmlRepresentationToRoot(message: ParsedMessage, rootElem: Element) {
        let stack = [{element: rootElem, tagName: 'root'}];
        let tagIdCounter = 0;
        message.parts().forEach((part) => {
            switch (part.type) {
                case ParsedMessagePartType.TEXT:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfTextPart(<ParsedMessagePartText> part, rootElem));
                    break;
                case ParsedMessagePartType.PLACEHOLDER:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfPlaceholderPart(<ParsedMessagePartPlaceholder> part, rootElem));
                    break;
                case ParsedMessagePartType.START_TAG:
                    let newTagElem = this.createXmlRepresentationOfStartTagPart(<ParsedMessagePartStartTag> part, rootElem, tagIdCounter);
                    tagIdCounter++;
                    stack[stack.length - 1].element.appendChild(newTagElem);
                    stack.push({element: <Element> newTagElem, tagName: (<ParsedMessagePartStartTag> part).tagName()});
                    break;
                case ParsedMessagePartType.END_TAG:
                    let closeTagName = (<ParsedMessagePartEndTag> part).tagName();
                    if (stack.length <= 1 || stack[stack.length - 1].tagName !== closeTagName) {
                        // oops, not well formed
                        throw new Error('unexpected close tag ' + closeTagName); // TODO error handling
                    }
                    stack.pop();
                    break;
            }
        });
        if (stack.length !== 1) {
            // oops, not well closed tags
            throw new Error('missing close tag ' + stack[stack.length - 1].tagName); // TODO error handling
        }
    }

    /**
     * the xml used for start tag in the message.
     * Returns an empty pc-Element.
     * e.g. <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">
     * Text content will be added later.
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element, id?: number): Node {
        const tagMapping = new TagMapping();
        let pcElem = rootElem.ownerDocument.createElement('pc');
        let equivStart = tagMapping.getStartTagPlaceholderName(part.tagName());
        let equivEnd = tagMapping.getCloseTagPlaceholderName(part.tagName());
        let dispStart = '<' + part.tagName() + '>';
        let dispEnd = '</' + part.tagName() + '>';
        pcElem.setAttribute('id', id.toString(10));
        pcElem.setAttribute('equivStart', equivStart);
        pcElem.setAttribute('equivEnd', equivEnd);
        pcElem.setAttribute('type', 'fmt');
        pcElem.setAttribute('dispStart', dispStart);
        pcElem.setAttribute('dispEnd', dispEnd);
        return pcElem;
    }

    /**
     * the xml used for end tag in the message.
     * Not used here, because content is child of start tag.
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node {
        // not used
        return null;
    }

    /**
     * the xml used for placeholder in the message.
     * Returns e.g. <ph id="1" equiv="INTERPOLATION_1" disp="{{total()}}"/>
     * @param part
     * @param rootElem
     */
    protected createXmlRepresentationOfPlaceholderPart(part: ParsedMessagePartPlaceholder, rootElem: Element): Node {
        let phElem = rootElem.ownerDocument.createElement('ph');
        let equivAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            equivAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        phElem.setAttribute('id', part.index().toString(10));
        phElem.setAttribute('equiv', equivAttrib);
        // disp ignored TODO copy from source ?
        phElem.setAttribute('disp', '{{todo()}}');
        return phElem;
    }


}
