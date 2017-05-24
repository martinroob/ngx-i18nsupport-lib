import {DOMParser} from "xmldom";
import {format} from 'util';
import {ITranslationMessagesFile, ITransUnit, FORMAT_XLIFF20, FILETYPE_XLIFF20} from '../api';
import {DOMUtilities} from './dom-utilities';
import {Xliff2TransUnit} from './xliff2-trans-unit';
import {AbstractTranslationMessagesFile} from './abstract-translation-messages-file';
import {AbstractTransUnit} from './abstract-trans-unit';
/**
 * Created by martin on 04.05.2017.
 * An XLIFF 2.0 file read from a source file.
 * Format definition is: http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 * Defines some relevant get and set method for reading and modifying such a file.
 */

export class Xliff2File extends AbstractTranslationMessagesFile implements ITranslationMessagesFile {

    /**
     * Create an XLIFF 2.0-File from source.
     * @param xmlString source read from file.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return {XliffFile}
     */
    constructor(xmlString: string, path: string, encoding: string) {
        super();
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding);
    }

    private initializeFromContent(xmlString: string, path: string, encoding: string): Xliff2File {
        this._filename = path;
        this._encoding = encoding;
        this._parsedDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
        const xliffList = this._parsedDocument.getElementsByTagName('xliff');
        if (xliffList.length !== 1) {
            throw new Error(format('File "%s" seems to be no xliff file (should contain an xliff element)', path));
        } else {
            const version = xliffList.item(0).getAttribute('version');
            const expectedVersion = '2.0';
            if (version !== expectedVersion) {
                throw new Error(format('File "%s" seems to be no xliff 2 file, version should be %s, found %s', path, expectedVersion, version));
            }
        }
        return this;
    }

    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    public i18nFormat(): string {
        return FORMAT_XLIFF20;
    }

    /**
     * File type.
     * Here 'XLIFF 2.0'
     */
    public fileType(): string {
        return FILETYPE_XLIFF20;
    }

    protected initializeTransUnits() {
        this.transUnits = [];
        let transUnitsInFile = this._parsedDocument.getElementsByTagName('unit');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            let transunit = transUnitsInFile.item(i);
            let id = transunit.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new Xliff2TransUnit(transunit, id, this));
        }
    }

    /**
     * Get source language.
     * @return {string}
     */
    public sourceLanguage(): string {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            return xliffElem.getAttribute('srcLang');
        } else {
            return null;
        }
    }

    /**
     * Edit the source language.
     * @param language
     */
    public setSourceLanguage(language: string) {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('srcLang', language);
        }
    }

    /**
     * Get target language.
     * @return {string}
     */
    public targetLanguage(): string {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            return xliffElem.getAttribute('trgLang');
        } else {
            return null;
        }
    }

    /**
     * Edit the target language.
     * @param language
     */
    public setTargetLanguage(language: string) {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('trgLang', language);
        }
    }

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
    public importNewTransUnit(transUnit: ITransUnit, isDefaultLang: boolean, copyContent: boolean) {
        if (this.transUnitWithId(transUnit.id)) {
            throw new Error(format('tu with id %s already exists in file, cannot import it', transUnit.id));
        }
        let newTu = (<AbstractTransUnit> transUnit).cloneWithSourceAsTarget(isDefaultLang, copyContent);
        let fileElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElement) {
            fileElement.appendChild(newTu.asXmlElement());
            this.lazyInitializeTransUnits();
            this.transUnits.push(newTu);
            this.countNumbers();
        } else {
            throw new Error(format('File "%s" seems to be no xliff 2.0 file (should contain a file element)', this._filename));
        }
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
    public createTranslationFileForLang(lang: string, filename: string, isDefaultLang: boolean, copyContent: boolean): ITranslationMessagesFile {
        let translationFile = new Xliff2File(this.editedContent(), filename, this.encoding());
        translationFile.setTargetLanguage(lang);
        translationFile.forEachTransUnit((transUnit: ITransUnit) => {
            (<AbstractTransUnit> transUnit).useSourceAsTarget(isDefaultLang, copyContent);
        });
        return translationFile;
    }
}