/**
 * Created by martin on 09.05.2017.
 * A normalized message is an abstraction of a translation containing some markup.
 * Markup can be placeholders or html tags.
 */

export type ValidationErrors = {
    [key: string]: any
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
     * Returns the message content as format dependent native string.
     * Includes all format specific markup like <ph id="INTERPOLATION" ../> ..
     */
    asNativeString(): string;

    /**
     * Create a new normalized message as a translation of this one.
     * @param normalizedString
     */
    translate(normalizedString: string): INormalizedMessage;
}