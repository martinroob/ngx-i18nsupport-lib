import {ParsedMessage} from './parsed-message';
/**
 * Created by roobm on 10.05.2017.
 * Interface of a MessageParser.
 * A message parser can parse the xml content of a translatable message.
 * It generates a ParsedMessage from it.
 */
export interface IMessageParser {

    /**
     * Format of the translation file.
     * xmb xliff xliff2
     * Returns one of the constants FORMAT_..
     */
    i18nFormat(): string;

    /**
     * Parse XML to ParsedMessage.
     * @param xmlElement the xml representation
     */
    parseElement(xmlElement: Element): ParsedMessage;

    /**
     * Parse normalized string to ParsedMessage.
     * @param normalizedString
     * @param sourceMessage
     */
    parseNormalizedString(normalizedString: string, sourceMessage: ParsedMessage): ParsedMessage;

}