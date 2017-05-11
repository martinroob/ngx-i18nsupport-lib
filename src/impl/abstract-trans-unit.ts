import {ITranslationMessagesFile, ITransUnit, INormalizedMessage} from '../api';
import {AbstractTranslationMessagesFile} from './abstract-translation-messages-file';
/**
 * Created by roobm on 10.05.2017.
 * Abstract superclass for all implementations of ITransUnit.
 */

export abstract class AbstractTransUnit implements ITransUnit {

    constructor(protected _element: Element, protected _id: string, protected _translationMessagesFile: ITranslationMessagesFile) {

    }

    public get id(): string {
        return this._id;
    }

    /**
     * The file the unit belongs to.,
     */
    translationMessagesFile(): ITranslationMessagesFile {
        return this._translationMessagesFile;
    }

    /**
     * The original text value, that is to be translated.
     * Contains all markup, depends on the concrete format used.
     */
    abstract sourceContent(): string;

    /**
     * The original text value, that is to be translated, as normalized message.
     */
    abstract sourceContentNormalized(): INormalizedMessage;

    /**
     * The translated value.
     * Contains all markup, depends on the concrete format used.
     */
    abstract targetContent(): string;

    /**
     * The translated value as normalized message.
     * All placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    abstract targetContentNormalized(): INormalizedMessage;

    /**
     * State of the translation as stored in the xml.
     */
    abstract nativeTargetState(): string;

    /**
     * State of the translation.
     * (on of new, translated, final)
     * Return values are defined as Constants STATE_...
     */
    public targetState(): string {
        const nativeState = this.nativeTargetState();
        return this.mapNativeStateToState(nativeState);
    }

    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    protected abstract mapStateToNativeState(state: string): string;

    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState
     */
    protected abstract mapNativeStateToState(nativeState: string): string;

    /**
     * set state in xml.
     * @param nativeState
     */
    protected abstract setNativeTargetState(nativeState: string);

    /**
     * Modify the target state.
     * @param newState one of the 3 allowed target states new, translated, final.
     * Constants STATE_...
     * Invalid states throw an error.
     */
    setTargetState(newState: string) {
        this.setNativeTargetState(this.mapStateToNativeState(newState));
        if (this.translationMessagesFile() instanceof AbstractTranslationMessagesFile) {
            (<AbstractTranslationMessagesFile> this.translationMessagesFile()).countNumbers();
        }
    }

    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    abstract sourceReferences(): {sourcefile: string, linenumber}[];

    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     */
    abstract description(): string;

    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     */
    abstract meaning(): string;

    /**
     * The real xml element used for the trans unit.
     * (internal usage only, a client should never need this)
     * @return {Element}
     */
    public asXmlElement(): Element {
        return this._element;
    }

    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call useSourceAsTarget on ITranslationMessageFile)
     */
    abstract useSourceAsTarget(isDefaultLang: boolean, copyContent: boolean);

    /**
     * Translate the trans unit.
     * @param translation the translated string or (preferred) a normalized message.
     * The pure string can contain any markup and will not be checked.
     * So it can damage the document.
     * A normalized message prevents this.
     */
    abstract translate(translation: string | INormalizedMessage);

}