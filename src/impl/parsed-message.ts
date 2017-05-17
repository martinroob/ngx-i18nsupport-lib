import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
import {ParsedMessagePartText} from './parsed-message-part-text';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {INormalizedMessage, ValidationErrors} from '../api/i-normalized-message';
import {XMLSerializer} from 'xmldom';
import {DOMUtilities} from './dom-utilities';
import {IMessageParser} from './i-message-parser';
/**
 * Created by martin on 05.05.2017.
 * A message text read from a translation file.
 * Can contain placeholders, tags, text.
 * This class is a representation independent of the concrete format.
 */
export class ParsedMessage implements INormalizedMessage {

    /**
     * Parser that created this message (determines the native format).
     */
    private _parser: IMessageParser;

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

    constructor(parser: IMessageParser, sourceMessage: ParsedMessage) {
        this._parser = parser;
        this.sourceMessage = sourceMessage;
        this._parts = [];
    }

    /**
     * Create a new normalized message as a translation of this one.
     * @param normalizedString
     */
    public translate(normalizedString: string): INormalizedMessage {
        return this._parser.parseNormalizedString(normalizedString, this);
    }

    /**
     * normalized message as string.
     * @param format optional way to determine the exact syntax.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     */
    public asDisplayString(format?: string) {
        return this._parts.map((part) => part.asDisplayString(format)).join('');
    }

    /**
     * Returns the message content as format dependent native string.
     * Includes all format specific markup like <ph id="INTERPOLATION" ../> ..
     */
    asNativeString(): string {
        return DOMUtilities.getXMLContent(this._xmlRepresentation);
    }

    /**
     * Validate the message.
     * @return null, if ok, error object otherwise.
     */
    public validate(): ValidationErrors | null {
        // TODO
        return null;
    }

    public parts(): ParsedMessagePart[] {
        return this._parts;
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

    addStartTag(tagname: string) {
        this._parts.push(new ParsedMessagePartStartTag(tagname));
    }

    addEndTag(tagname: string) {
        // check if well formed
        const openTag = this.calculateOpenTagName();
        if (!openTag || openTag !== tagname) {
            // oops, not well formed
            throw new Error('unexpected close tag ' + tagname);
        }
        this._parts.push(new ParsedMessagePartEndTag(tagname));
    }

    /**
     * Determine, wether there is an open tag, that is not closed.
     * Returns the latest one or null, if there is no open tag.
     */
    private calculateOpenTagName(): string {
        let openTags = [];
        this._parts.forEach((part) => {
            switch (part.type) {
                case ParsedMessagePartType.START_TAG:
                    openTags.push((<ParsedMessagePartStartTag> part).tagName());
                    break;
                case ParsedMessagePartType.END_TAG:
                    const tagName = (<ParsedMessagePartEndTag> part).tagName();
                    if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                        // oops, not well formed
                        throw new Error('unexpected close tag ' + tagName);
                    }
                    openTags.pop();
            }
        });
        return openTags.length === 0 ? null : openTags[openTags.length - 1];
    }
}