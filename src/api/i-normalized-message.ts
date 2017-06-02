import {IICUMessage} from './i-icu-message';

/**
 * Created by martin on 09.05.2017.
 * A normalized message is an abstraction of a translation containing some markup.
 * Markup can be placeholders or html tags.
 */

export type ValidationErrors = {
    [key: string]: any;
    placeholderAdded?: string;
    placeholderRemoved?: string;
    tagAdded?: string;
    tagRemoved?: string;
};

export interface INormalizedMessage {

    /**
     * normalized message as string.
     * @param format optional way to determine the exact syntax.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     */
    asDisplayString(format?: string): string;

    /**
     * Validate the message.
     * @return null, if ok, error object otherwise.
     */
    validate(): ValidationErrors | null;

    /**
     * Validate the message, check for warnings only.
     * A warning shows, that the message is acceptable, but misses something.
     * E.g. if you remove a placeholder or a special tag from the original message, this generates a warning.
     * @return null, if no warning, warnings as error object otherwise.
     */
    validateWarnings(): ValidationErrors | null;

    /**
     * Returns the message content as format dependent native string.
     * Includes all format specific markup like <ph id="INTERPOLATION" ../> ..
     */
    asNativeString(): string;

    /**
     * If this message is an ICU message, returns its structure.
     * Otherwise this method returns null.
     * @return ICUMessage or null.
     */
    getICUMessage(): IICUMessage;

    /**
     * Create a new normalized message as a translation of this one.
     * @param normalizedString
     * Throws an error if normalized string is not well formed.
     */
    translate(normalizedString: string): INormalizedMessage;

    /**
     * Create a new normalized message from a native xml string as a translation of this one.
     * @param nativeString xml string in the format of the underlying file format.
     * Throws an error if native string is not acceptable.
     */
    translateNativeString(nativeString: string): INormalizedMessage;

}