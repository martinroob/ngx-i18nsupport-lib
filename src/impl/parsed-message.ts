import {ParsedMessagePart} from './parsed-message-part';
import {ParsedMessagePartText} from './parsed-message-part-text';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
/**
 * Created by martin on 05.05.2017.
 * A message text read from a translation file.
 * Can contain placeholders, tags, text.
 * This class is a representation independent of the concrete format.
 */
export class ParsedMessage {
    private _parts: ParsedMessagePart[];

    constructor() {
        this._parts = [];
    }

    public asDisplayString() {
        return this._parts.map((part) => part.asDisplayString()).join('');
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