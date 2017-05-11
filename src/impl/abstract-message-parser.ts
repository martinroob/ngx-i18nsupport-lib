import {IMessageParser} from './i-message-parser';
import {ParsedMessage} from './parsed-message';
/**
 * Created by roobm on 10.05.2017.
 * A message parser can parse the xml content of a tzranslatable message.
 * It generates a ParsedMessage from it.
 */
export abstract class AbstractMessageParser implements IMessageParser {

    public parseElement(messageElem: Element): ParsedMessage {
        let message: ParsedMessage = new ParsedMessage();
        if (messageElem) {
            this.addPartsOfNodeToMessage(messageElem, message, false);
        }
        return message;
    }

    /**
     * recursively run through a node and add all identified parts to the message.
     * @param node
     * @param message message to be generated.
     * @param includeSelf if true, add node by itself, otherwise only children.
     */
    private addPartsOfNodeToMessage(node: Node, message: ParsedMessage, includeSelf: boolean) {
        let processChildren = true;
        if (includeSelf) {
            if (node.nodeType === node.TEXT_NODE) {
                message.addText(node.textContent);
                return;
            }
            if (node.nodeType === node.ELEMENT_NODE) {
                processChildren = this.processStartElement(<Element> node, message);
            }
        }
        if (processChildren) {
            const children = node.childNodes;
            for (let i = 0; i < children.length; i++) {
                this.addPartsOfNodeToMessage(children.item(i), message, true);
            }
        }
        if (node.nodeType === node.ELEMENT_NODE) {
            this.processEndElement(<Element> node, message);
        }
    }

    /**
     * Handle this node.
     * This is called before the children are done.
     * @param elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    protected abstract processStartElement(elementNode: Element, message: ParsedMessage): boolean;

    /**
     * Handle end of this node.
     * This is called after all children are processed.
     * @param elementNode
     * @param message message to be altered
     */
    protected abstract processEndElement(elementNode: Element, message: ParsedMessage);

}