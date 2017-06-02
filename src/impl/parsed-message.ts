import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
import {ParsedMessagePartText} from './parsed-message-part-text';
import {ParsedMessagePartPlaceholder} from './parsed-message-part-placeholder';
import {ParsedMessagePartStartTag} from './parsed-message-part-start-tag';
import {ParsedMessagePartEndTag} from './parsed-message-part-end-tag';
import {INormalizedMessage, ValidationErrors} from '../api/i-normalized-message';
import {XMLSerializer} from 'xmldom';
import {DOMUtilities} from './dom-utilities';
import {IMessageParser} from './i-message-parser';
import {format, isNullOrUndefined} from 'util';
import {IICUMessage} from '../api/i-icu-message';
import {ParsedMessagePartICUMessage} from './parsed-message-part-icu-message';
import {ParsedMessagePartICUMessageRef} from './parsed-message-part-icu-message-ref';
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
     * Create a new normalized message from a native xml string as a translation of this one.
     * @param nativeString xml string in the format of the underlying file format.
     * Throws an error if native string is not acceptable.
     */
    translateNativeString(nativeString: string): INormalizedMessage {
        return this._parser.createNormalizedMessageFromXMLString(nativeString, this);
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
        let hasErrors = false;
        let errors: ValidationErrors = {};
        let e;
        e = this.checkPlaceholderAdded();
        if (!isNullOrUndefined(e)) {
            errors.placeholderAdded = e;
            hasErrors = true;
        }
        return hasErrors ? errors : null;
    }

    /**
     * Validate the message, check for warnings only.
     * A warning shows, that the message is acceptable, but misses something.
     * E.g. if you remove a placeholder or a special tag from the original message, this generates a warning.
     * @return null, if no warning, warnings as error object otherwise.
     */
    validateWarnings(): ValidationErrors | null {
        let hasWarnings = false;
        let warnings: ValidationErrors = {};
        let w;
        w = this.checkPlaceholderRemoved();
        if (!isNullOrUndefined(w)) {
            warnings.placeholderRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagRemoved();
        if (!isNullOrUndefined(w)) {
            warnings.tagRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagAdded();
        if (!isNullOrUndefined(w)) {
            warnings.tagAdded = w;
            hasWarnings = true;
        }
        return hasWarnings ? warnings : null;
    }

    /**
     * If this message is an ICU message, returns its structure.
     * Otherwise this method returns null.
     * @return ICUMessage or null.
     */
    public getICUMessage(): IICUMessage {
        if (this.parts.length === 1 && this.parts[0].type === ParsedMessagePartType.ICU_MESSAGE) {
            const icuPart = <ParsedMessagePartICUMessage> this.parts[0];
            return icuPart.getICUMessage();
        } else {
            return null;
        }
    }


    /**
     * Check for added placeholder.
     * @return null or message, if fulfilled.
     */
    private checkPlaceholderAdded(): any {
        let e;
        if (this.sourceMessage) {
            let sourcePlaceholders = this.sourceMessage.allPlaceholders();
            let myPlaceholders = this.allPlaceholders();
            myPlaceholders.forEach((index) => {
                if (!sourcePlaceholders.has(index)) {
                    e = 'added placeholder ' + index + ', which is not in original message';
                }
            });
        }
        return e;
    }

    /**
     * Check for removed placeholder.
     * @return null or message, if fulfilled.
     */
    private checkPlaceholderRemoved(): any {
        let w;
        if (this.sourceMessage) {
            let sourcePlaceholders = this.sourceMessage.allPlaceholders();
            let myPlaceholders = this.allPlaceholders();
            sourcePlaceholders.forEach((index) => {
                if (!myPlaceholders.has(index)) {
                    w = 'removed placeholder ' + index + ' from original messages';
                }
            });
        }
        return w;
    }

    /**
     * Get all indexes of placeholders used in the message.
     */
    private allPlaceholders(): Set<number> {
        let result = new Set<number>();
        this.parts().forEach((part) => {
            if (part.type === ParsedMessagePartType.PLACEHOLDER) {
                let index = (<ParsedMessagePartPlaceholder> part).index();
                result.add(index);
            }
        });
        return result;
    }

    /**
     * Check for added tags.
     * @return null or message, if fulfilled.
     */
    private checkTagAdded(): any {
        let e;
        if (this.sourceMessage) {
            let sourceTags = this.sourceMessage.allTags();
            let myTags = this.allTags();
            myTags.forEach((tagName) => {
                if (!sourceTags.has(tagName)) {
                    e = 'added tag <' + tagName + '>, which is not in original message';
                }
            });
        }
        return e;
    }

    /**
     * Check for removed tags.
     * @return null or message, if fulfilled.
     */
    private checkTagRemoved(): any {
        let w;
        if (this.sourceMessage) {
            let sourceTags = this.sourceMessage.allTags();
            let myTags = this.allTags();
            sourceTags.forEach((tagName) => {
                if (!myTags.has(tagName)) {
                    w = 'removed tag <' + tagName + '> from original messages';
                }
            });
        }
        return w;
    }

    /**
     * Get all tag names used in the message.
     */
    private allTags(): Set<string> {
        let result = new Set<string>();
        this.parts().forEach((part) => {
            if (part.type === ParsedMessagePartType.START_TAG) {
                let tagName = (<ParsedMessagePartStartTag> part).tagName();
                result.add(tagName);
            }
        });
        return result;
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
            throw new Error(format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagname, openTag, this.asNativeString()));
        }
        this._parts.push(new ParsedMessagePartEndTag(tagname));
    }

    addICUMessageRef(index: number) {
        this._parts.push(new ParsedMessagePartICUMessageRef(index));
    }

    addICUMessage(text: string) {
        this._parts.push(new ParsedMessagePartICUMessage(text));
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
                        const openTag = (openTags.length === 0) ? 'nothing' : openTags[openTags.length - 1];
                        throw new Error(format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagName, openTag, this.asNativeString()));
                    }
                    openTags.pop();
            }
        });
        return openTags.length === 0 ? null : openTags[openTags.length - 1];
    }
}