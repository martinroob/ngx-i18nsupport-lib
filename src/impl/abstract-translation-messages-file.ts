import {ITranslationMessagesFile, ITransUnit, STATE_NEW, STATE_TRANSLATED} from '../api';
import {isNullOrUndefined} from 'util';
import {XMLSerializer} from 'xmldom';
import {AbstractTransUnit} from './abstract-trans-unit';
/**
 * Created by roobm on 09.05.2017.
 * Abstract superclass for all implementations of ITranslationMessagesFile.
 */

export abstract class AbstractTranslationMessagesFile implements ITranslationMessagesFile {

    protected _filename: string;

    protected _encoding: string;

    protected _parsedDocument: Document;

    // trans-unit elements and their id from the file
    protected transUnits: ITransUnit[];

    protected _warnings: string[];

    protected _numberOfTransUnitsWithMissingId: number;

    protected _numberOfUntranslatedTransUnits: number;

    protected _numberOfReviewedTransUnits: number;

    constructor() {
        this.transUnits = null;
        this._warnings = [];
    }

    abstract i18nFormat(): string;

    abstract fileType(): string;

    /**
     * Read all trans units from xml content.
     * Puts the found units into transUnits.
     * Puts warnings for missing ids.
     */
    protected abstract initializeTransUnits();

    protected lazyInitializeTransUnits() {
        if (isNullOrUndefined(this.transUnits)) {
            this.initializeTransUnits();
            this.countNumbers();
        }
    }

    /**
     * count units after changes of trans units
     */
    public countNumbers() {
        this._numberOfTransUnitsWithMissingId = 0;
        this._numberOfUntranslatedTransUnits = 0;
        this._numberOfReviewedTransUnits = 0;
        this.forEachTransUnit((tu: ITransUnit) => {
            if (isNullOrUndefined(tu.id) || tu.id === '') {
                this._numberOfTransUnitsWithMissingId++;
            }
            const state = tu.targetState();
            if (isNullOrUndefined(state) || state === STATE_NEW) {
                this._numberOfUntranslatedTransUnits++;
            }
            if (state === STATE_TRANSLATED) {
                this._numberOfReviewedTransUnits++;
            }
        });
    }

    public warnings(): string[] {
        this.lazyInitializeTransUnits();
        return this._warnings;
    }

    /**
     * Total number of translation units found in the file.
     */
    public numberOfTransUnits(): number {
        this.lazyInitializeTransUnits();
        return this.transUnits.length;
    }

    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfUntranslatedTransUnits(): number {
        this.lazyInitializeTransUnits();
        return this._numberOfUntranslatedTransUnits;
    }

    /**
     * Number of translation units with state 'final'.
     */
    numberOfReviewedTransUnits(): number {
        this.lazyInitializeTransUnits();
        return this._numberOfReviewedTransUnits;
    }

    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    public numberOfTransUnitsWithMissingId(): number {
        this.lazyInitializeTransUnits();
        return this._numberOfTransUnitsWithMissingId;
    }

    /**
     * Get source language.
     * @return {string}
     */
    abstract sourceLanguage(): string;

    /**
     * Get target language.
     * @return {string}
     */
    abstract targetLanguage(): string;

    /**
     * Loop over all Translation Units.
     * @param callback
     */
    public forEachTransUnit(callback: ((transunit: ITransUnit) => void)) {
        this.lazyInitializeTransUnits();
        this.transUnits.forEach((tu) => callback(tu));
    }

    /**
     * Get trans-unit with given id.
     * @param id
     * @return {ITransUnit}
     */
    public transUnitWithId(id: string): ITransUnit {
        this.lazyInitializeTransUnits();
        return this.transUnits.find((tu) => tu.id === id);
    }

    /**
     * Edit functions following her
     */

    /**
     * Edit the source language.
     * @param language
     */
    abstract setSourceLanguage(language: string);

    /**
     * Edit the target language.
     * @param language
     */
    abstract setTargetLanguage(language: string);

    /**
     * Add a new trans-unit to this file.
     * The trans unit stems from another file.
     * It copies the source content of the tu to the target content too,
     * depending on the values of isDefaultLang and copyContent.
     * So the source can be used as a dummy translation.
     * (used by xliffmerge)
     * @param transUnit the trans unit to be imported.
     * @param isDefaultLang Flag, wether file contains the default language.
     * Then source and target are just equal.
     * The content will be copied.
     * State will be final.
     * @param copyContent Flag, wether to copy content or leave it empty.
     * Wben true, content will be copied from source.
     * When false, content will be left empty (if it is not the default language).
     * @throws an error if trans-unit with same id already is in the file.
     */
    abstract importNewTransUnit(transUnit: ITransUnit, isDefaultLang: boolean, copyContent: boolean);

    /**
     * Remove the trans-unit with the given id.
     * @param id
     */
    public removeTransUnitWithId(id: string) {
        let tuNode: Node = this._parsedDocument.getElementById(id);
        if (tuNode) {
            tuNode.parentNode.removeChild(tuNode);
            this.lazyInitializeTransUnits();
            this.transUnits = this.transUnits.filter((tu) => tu.id !== id);
            this.countNumbers();
        }
    }

    /**
     * The filename where the data is read from.
     */
    public filename(): string {
        return this._filename;
    }

    /**
     * The encoding if the xml content (UTF-8, ISO-8859-1, ...)
     */
    public encoding(): string {
        return this._encoding;
    }

    /**
     * The xml content to be saved after changes are made.
     */
    public editedContent(): string {
        return new XMLSerializer().serializeToString(this._parsedDocument);
    }

    /**
     * Create a new translation file for this file for a given language.
     * Normally, this is just a copy of the original one.
     * But for XMB the translation file has format 'XTB'.
     * @param lang Language code
     * @param filename expected filename to store file
     * @param isDefaultLang Flag, wether file contains the default language.
     * Then source and target are just equal.
     * The content will be copied.
     * State will be final.
     * @param copyContent Flag, wether to copy content or leave it empty.
     * Wben true, content will be copied from source.
     * When false, content will be left empty (if it is not the default language).
     */
    abstract createTranslationFileForLang(lang: string, filename: string, isDefaultLang: boolean, copyContent: boolean): ITranslationMessagesFile;
}
