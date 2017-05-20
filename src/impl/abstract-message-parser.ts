import {ParsedMessage} from './parsed-message';
import {END_TAG, ParsedMesageTokenizer, PLACEHOLDER, START_TAG, TEXT, Token} from './parsed-message-tokenizer';
import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
import {ParsedMessagePartText} from './parsed-message-part-text';
import {DOMParser} from 'xmldom';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {IMessageParser} from './i-message-parser';
/**
 * Created by roobm on 10.05.2017.
 * A message parser can parse the xml content of a translatable message.
 * It generates a ParsedMessage from it.
 */
export abstract class AbstractMessageParser implements IMessageParser {

    /**
     * Format of the translation file.
     * xmb xliff xliff2
     * Returns one of the constants FORMAT_..
     */
    abstract i18nFormat(): string;

    /**
     * Parse XML to ParsedMessage.
     * @param xmlElement the xml representation
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    public createNormalizedMessageFromXML(xmlElement: Element, sourceMessage: ParsedMessage): ParsedMessage {
        const message: ParsedMessage = new ParsedMessage(this, sourceMessage);
        if (xmlElement) {
            message.setXmlRepresentation(xmlElement);
            this.addPartsOfNodeToMessage(xmlElement, message, false);
        }
        return message;
    }

    /**
     * Parse XML string to ParsedMessage.
     * @param xmlString the xml representation without root element, e.g. this is <ph x></ph> an example.
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    createNormalizedMessageFromXMLString(xmlString: string, sourceMessage: ParsedMessage): ParsedMessage {
        let doc: Document = new DOMParser().parseFromString('<dummy>' + xmlString + '</dummy>', 'text/xml');
        let xmlElement: Element = <Element> doc.childNodes.item(0);
        return this.createNormalizedMessageFromXML(xmlElement, sourceMessage);
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

    /**
     * Parse normalized string to ParsedMessage.
     * @param normalizedString normalized string
     * @param sourceMessage optional original message that will be translated by normalized new one
     * @return a new parsed message.
     * Throws an error if normalized string is not well formed.
     */
    public parseNormalizedString(normalizedString: string, sourceMessage: ParsedMessage): ParsedMessage {
        const message: ParsedMessage = new ParsedMessage(this, sourceMessage);
        let openTags = [];
        let tokens: Token[];
        try {
            tokens = new ParsedMesageTokenizer().tokenize(normalizedString);
        } catch (error) {
            throw new Error('unexpected error while parsing message: ' + error.message); // TODO error handling
        }
        tokens.forEach((token: Token) => {
            switch (token.type) {
                case TEXT:
                    message.addText(token.value);
                    break;
                case START_TAG:
                    message.addStartTag(token.value);
                    openTags.push(token.value);
                    break;
                case END_TAG:
                    message.addEndTag(token.value);
                    if (openTags.length === 0 || openTags[openTags.length - 1] !== token.value) {
                        // oops, not well formed
                        throw new Error('unexpected close tag ' + token.value); // TODO error handling
                    }
                    openTags.pop();
                    break;
                case PLACEHOLDER:
                    message.addPlaceholder(token.value);
                    break;
                default:
                    break;
            }
        });
        if (openTags.length > 0) {
            // oops, not well closed tags
            throw new Error('missing close tag ' + openTags[openTags.length - 1]); // TODO error handling
        }
        message.setXmlRepresentation(this.createXmlRepresentation(message));
        return message;
    }

    /**
     * Create the native xml for a message.
     * Parts are already set here.
     * @param message
     */
    protected createXmlRepresentation(message: ParsedMessage): Element {
        let root: Document = new DOMParser().parseFromString('<dummy/>', 'text/xml');
        let rootElem: Element = root.getElementsByTagName('dummy').item(0);
        this.addXmlRepresentationToRoot(message, rootElem);
        return rootElem;
    }

    protected addXmlRepresentationToRoot(message: ParsedMessage, rootElem: Element) {
        message.parts().forEach((part) => {
            const child = this.createXmlRepresentationOfPart(part, rootElem);
            if (child) {
                rootElem.appendChild(child);
            }
        });
    }

    protected createXmlRepresentationOfPart(part: ParsedMessagePart, rootElem: Element): Node {
        switch (part.type) {
            case ParsedMessagePartType.TEXT:
                return this.createXmlRepresentationOfTextPart(<ParsedMessagePartText> part, rootElem);
            case ParsedMessagePartType.START_TAG:
                return this.createXmlRepresentationOfStartTagPart((<ParsedMessagePartStartTag>part), rootElem);
            case ParsedMessagePartType.END_TAG:
                return this.createXmlRepresentationOfEndTagPart((<ParsedMessagePartEndTag>part), rootElem);
            case ParsedMessagePartType.PLACEHOLDER:
                return this.createXmlRepresentationOfPlaceholderPart((<ParsedMessagePartPlaceholder>part), rootElem);
        }
    }

    protected createXmlRepresentationOfTextPart(part: ParsedMessagePartText, rootElem: Element, id?: number): Node {
        return rootElem.ownerDocument.createTextNode(part.asDisplayString());
    }

    /**
     * the xml used for start tag in the message.
     * @param part
     * @param rootElem
     */
    protected abstract createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element): Node;

    /**
     * the xml used for end tag in the message.
     * @param part
     * @param rootElem
     */
    protected abstract createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node;

    /**
     * the xml used for placeholder in the message.
     * @param part
     * @param rootElem
     */
    protected abstract createXmlRepresentationOfPlaceholderPart(part: ParsedMessagePartPlaceholder, rootElem: Element): Node;

}