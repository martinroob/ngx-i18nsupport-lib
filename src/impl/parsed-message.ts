import {ParsedMessagePart} from './parsed-message-part';
import {ParsedMessagePartText} from './parsed-message-part-text';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {INormalizedMessage, ValidationErrors} from '../api/i-normalized-message';
/**
 * Created by martin on 05.05.2017.
 * A message text read from a translation file.
 * Can contain placeholders, tags, text.
 * This class is a representation independent of the concrete format.
 */
export class ParsedMessage implements INormalizedMessage {
    private _parts: ParsedMessagePart[];

    constructor() {
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
     * Translate the message.
     * @param normalizedForm the translated message string.
     * @param format optional way to determine the exact syntax.
     * Only needed for the strange case, that the normalizedForm uses a different syntax as the receiver.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     * @return a new normalized message, that contains the translated message.
     */
    public translate(normalizedForm: string, format?: string): INormalizedMessage {
        // TODO
        return null;
    }

    /**
     * Validate the message.
     * @return null, if ok, error object otherwise.
     */
    public validate(): ValidationErrors | null {
        // TODO
        return null;
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