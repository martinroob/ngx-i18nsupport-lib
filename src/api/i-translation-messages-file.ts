import {XliffFile} from '../impl/xliff-file';
import {XmbFile} from '../impl/xmb-file';
import {format} from 'util';
import {ITransUnit} from './i-trans-unit';

/**
 * The Common interface of XliffFile and XmbFile.
 * The merge process only uses this interface.
 * Created by martin on 10.03.2017.
 */
export interface ITranslationMessagesFile {

    /**
     * File type as displayable, human readable string.
     * Currently 'XLIFF 1.2', 'XLIFF 2.0' or 'XMB'
     * Returns one of the constants FILETYPE_..
     */
    fileType(): string;

    /**
     * warnings found in the file
     */
    warnings(): string[];

    /**
     * Total number of translation units found in the file.
     */
    numberOfTransUnits(): number;

    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfUntranslatedTransUnits(): number;

    /**
     * Number of translation units with state 'final'.
     */
    numberOfReviewedTransUnits(): number;

    /**
     * Number of translation units without id found in the file.
     */
    numberOfTransUnitsWithMissingId(): number;

    /**
     * Get source language.
     * @return {string}
     */
    sourceLanguage(): string;

    /**
     * Get target language.
     * @return {string}
     */
    targetLanguage(): string;

    /**
     * Loop over all Translation Units.
     * @param callback
     */
    forEachTransUnit(callback: ((transunit: ITransUnit) => void));

    /**
     * Get trans-unit with given id.
     * @param id
     * @return {ITransUnit}
     */
    transUnitWithId(id: string): ITransUnit;

    /**
     * Edit functions following her
     */

    /**
     * Edit the source language.
     * @param language
     */
    setSourceLanguage(language: string);

    /**
     * Edit the target language.
     * @param language
     */
    setTargetLanguage(language: string);

    /**
     * Add a new trans-unit to this file.
     * The trans unit stems from another file.
     * (used by xliffmerge)
     * @param transUnit
     */
    addNewTransUnit(transUnit: ITransUnit);

    /**
     * Remove the trans-unit with the given id.
     * @param id
     */
    removeTransUnitWithId(id: string);

    /**
     * Copy source to target to use it as dummy translation.
     * (better than missing value)
     * @param transUnit the trans unit to be used.
     * @param isDefaultLang Flag, wether file contains the default language.
     * Then source and target are just equal.
     * The content will be copied.
     * State will be final.
     * @param copyContent Flag, wether to copy content or leave it empty.
     * Wben true, content will be copied from source.
     * When false, content will be left empty (if it is not the default language).
     */
    useSourceAsTarget(transUnit: ITransUnit, isDefaultLang: boolean, copyContent: boolean);

    /**
     * The filename where the data is read from.
     */
    filename(): string;

    /**
     * The encoding if the xml content (UTF-8, ISO-8859-1, ...)
     */
    encoding(): string;

    /**
     * The xml content to be saved after changes are made.
     */
    editedContent(): string;

}