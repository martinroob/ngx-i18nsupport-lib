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
     * Translate the message.
     * @param normalizedForm the translated message string.
     * @param format optional way to determine the exact syntax.
     * Only needed for the strange case, that the normalizedForm uses a different syntax as the receiver.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     * @return a new normalized message, that contains the translated message.
     */
    translate(normalizedForm: string, format?: string): INormalizedMessage;

    /**
     * Validate the message.
     * @return null, if ok, error object otherwise.
     */
    validate(): ValidationErrors | null;
}