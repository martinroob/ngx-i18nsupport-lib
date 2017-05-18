import {INormalizedMessage} from './i-normalized-message';
import {ITranslationMessagesFile} from './i-translation-messages-file';

/**
 * Created by martin on 19.03.2017.
 */

/**
 * Interface of a translation unit in a translation messages file.
 */
export interface ITransUnit {

    readonly id: string;

    /**
     * The file the unit belongs to.,
     */
    translationMessagesFile(): ITranslationMessagesFile;

    /**
     * The original text value, that is to be translated.
     * Contains all markup, depends on the concrete format used.
     */
    sourceContent(): string;

    /**
     * The original text value, that is to be translated, as normalized message.
     * Throws an error if normalized xml is not well formed.
     * (which should not happen in generated files)
     */
    sourceContentNormalized(): INormalizedMessage;

    /**
     * The translated value.
     * Contains all markup, depends on the concrete format used.
     */
    targetContent(): string;

    /**
     * The translated value as normalized message.
     * All placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     * Throws an error if normalized xml is not well formed.
     * (which should not happen in generated files)
     */
    targetContentNormalized(): INormalizedMessage;

    /**
     * State of the translation.
     * (on of new, translated, final)
     * Return values are defined as Constants STATE_...
     */
    targetState(): string;

    /**
     * Modify the target state.
     * @param newState one of the 3 allowed target states new, translated, final.
     * Constants STATE_...
     * Invalid states throw an error.
     */
    setTargetState(newState: string);

    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    sourceReferences(): {sourcefile: string, linenumber}[];

    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     */
    description(): string;

    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     */
    meaning(): string;

    /**
     * Translate the trans unit.
     * @param translation the translated string or (preferred) a normalized message.
     * The pure string can contain any markup and will not be checked.
     * So it can damage the document.
     * A normalized message prevents this.
     */
    translate(translation: string | INormalizedMessage);

}
