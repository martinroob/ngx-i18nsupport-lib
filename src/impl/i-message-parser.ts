import {ParsedMessage} from './parsed-message';
/**
 * Created by roobm on 10.05.2017.
 * Interface of a MessageParser.
 * A message parser can parse the xml content of a tzranslatable message.
 * It generates a ParsedMessage from it.
 */
export interface IMessageParser {

    /**
     * Parse xml to ParsedMessage.
     * @param messageElement
     */
    parseElement(messageElement: Element): ParsedMessage;
}