import {ParsedMessagePart} from './parsed-message-part';
import {ParsedMessagePartText} from './parsed-message-part-text';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {INormalizedMessage, ValidationErrors} from '../api/i-normalized-message';
import {MessageParserFactory} from './message-parser-factory';
/**
 * Created by martin on 05.05.2017.
 * A message text read from a translation file.
 * Can contain placeholders, tags, text.
 * This class is a representation independent of the concrete format.
 */
export class ParsedMessage implements INormalizedMessage {

    /**
     * The internal format of the message
     */
    private i18nFormat: string;

    /**
     * The message where this one stems from as translation.
     * Optional, set only for messages created by calling translate.
     */
    private sourceMessage: ParsedMessage;

    /**
     * The parts of the message.
     */
    private _parts: ParsedMessagePart[];

    /**
     * messages xml representation.
     */
    private _xmlRepresentation: Element;

    constructor(i18nFormat: string, sourceMessage: ParsedMessage) {
        this.i18nFormat = i18nFormat;
        this.sourceMessage = sourceMessage;
        this._parts = [];
    }

    /**
     * normalized message as string.
     * @param format optional way to determine the exact syntax.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     */
    public asDisplayString() {
        // TODO
        return this._parts.map((part) => part.asDisplayString()).join('');
    }

    /**
     * Returns the message content as format dependent native string.
     * Includes all format specific markup like <ph id="INTERPOLATION" ../> ..
     */
    asNativeString(): string {
        return new XMLSerializer().serializeToString(this._xmlRepresentation);
    }

    /**
     * Translate the message.
     * @param normalizedForm the translated message string.
     * @param format optional way to determine the exact syntax.
     * Only needed for the strange case, that the normalizedForm uses a different syntax as the receiver.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     * @return a new normalized message, that contains the translated message.
     */
    public translate(normalizedForm: string, format?: string): INormalizedMessage {
        return MessageParserFactory.parserForFormat(this.i18nFormat).parseNormalizedString(normalizedForm, this);
    }

    /**
     * Validate the message.
     * @return null, if ok, error object otherwise.
     */
    public validate(): ValidationErrors | null {
        // TODO
        return null;
    }

    setXmlRepresentation(xmlRepresentation: Element) {
        this._xmlRepresentation = xmlRepresentation;
    }

    addText(text: string) {
        this._parts.push(new ParsedMessagePartText(text));
    }

    addPlaceholder(index: number) {
        this._parts.push(new ParsedMessagePartPlaceholder(index));
    }

    addOpenTag(tagname: string) {
        this._parts.push(new ParsedMessagePartStartTag(tagname));
    }

    addCloseTag(tagname: string) {
        this._parts.push(new ParsedMessagePartEndTag(tagname));
    }
}