import {DOMParser, XMLSerializer} from "xmldom";
import {isNullOrUndefined, format} from 'util';
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {ITransUnit} from '../api/i-trans-unit';
import {DOMUtilities} from './dom-utilities';
import {XliffTransUnit} from './xliff-trans-unit';
/**
 * Created by martin on 23.02.2017.
 * Ab xliff file read from a source file.
 * Defines some relevant get and set method for reading and modifying such a file.
 */

export class XliffFile implements ITranslationMessagesFile {

    private _filename: string;

    private _encoding: string;

    private xliffContent: Document;

    // trans-unit elements and their id from the file
    private transUnits: ITransUnit[];

    private _warnings: string[];
    private _numberOfTransUnitsWithMissingId: number;

    /**
     * Create an xlf-File from source.
     * @param xmlString source read from file.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return {XliffFile}
     */
    constructor(xmlString: string, path: string, encoding: string) {
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding);
    }

    private initializeFromContent(xmlString: string, path: string, encoding: string): XliffFile {
        this._filename = path;
        this._encoding = encoding;
        this.xliffContent = new DOMParser().parseFromString(xmlString, 'text/xml');
        const xliffList = this.xliffContent.getElementsByTagName('xliff');
        if (xliffList.length !== 1) {
            throw new Error(format('File "%s" seems to be no xliff file (should contain an xliff element)', path));
        } else {
            const version = xliffList.item(0).getAttribute('version');
            const expectedVersion = '1.2';
            if (version !== expectedVersion) {
                throw new Error(format('File "%s" seems to be no xliff 2 file, version should be %s, found %s', path, expectedVersion, version));
            }
        }
        return this;
    }

    /**
     * File type.
     * Here 'XLIFF 1.2'
     */
    public fileType(): string {
        return 'XLIFF 1.2';
    }

    public forEachTransUnit(callback: ((transunit: ITransUnit) => void)) {
        this.initializeTransUnits();
        this.transUnits.forEach((tu) => callback(tu));
    }

    public warnings(): string[] {
        this.initializeTransUnits();
        return this._warnings;
    }

    public numberOfTransUnits(): number {
        this.initializeTransUnits();
        return this.transUnits.length;
    }

    public numberOfTransUnitsWithMissingId(): number {
        this.initializeTransUnits();
        return this._numberOfTransUnitsWithMissingId;
    }

    /**
     * Get trans-unit with given id.
     * @param id
     * @return {ITransUnit}
     */
    public transUnitWithId(id: string): ITransUnit {
        this.initializeTransUnits();
        return this.transUnits.find((tu) => tu.id === id);
    }

    private initializeTransUnits() {
        if (isNullOrUndefined(this.transUnits)) {
            this.transUnits = [];
            let transUnitsInFile = this.xliffContent.getElementsByTagName('trans-unit');
            for (let i = 0; i < transUnitsInFile.length; i++) {
                let transunit = transUnitsInFile.item(i);
                let id = transunit.getAttribute('id');
                if (!id) {
                    this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
                    this._numberOfTransUnitsWithMissingId++;
                }
                this.transUnits.push(new XliffTransUnit(transunit, id));
            }
        }
    }

    /**
     * Get source language.
     * @return {string}
     */
    public sourceLanguage(): string {
        const fileElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'file');
        if (fileElem) {
            return fileElem.getAttribute('source-language');
        } else {
            return null;
        }
    }

    /**
     * Edit the source language.
     * @param language
     */
    public setSourceLanguage(language: string) {
        const fileElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'file');
        if (fileElem) {
            fileElem.setAttribute('source-language', language);
        }
    }

    /**
     * Get target language.
     * @return {string}
     */
    public targetLanguage(): string {
        const fileElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'file');
        if (fileElem) {
            return fileElem.getAttribute('target-language');
        } else {
            return null;
        }
    }

    /**
     * Edit the target language.
     * @param language
     */
    public setTargetLanguage(language: string) {
        const fileElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'file');
        if (fileElem) {
            fileElem.setAttribute('target-language', language);
        }
    }

    /**
     * Copy source to target to use it as dummy translation.
     * (better than missing value)
     */
    public useSourceAsTarget(transUnit: ITransUnit, isDefaultLang: boolean, copyContent: boolean) {
        transUnit.useSourceAsTarget(isDefaultLang, copyContent);
    }

    /**
     * Translate a given trans unit.
     * (very simple, just for tests)
     * @param transUnit
     * @param translation the translated string
     */
    public translate(transUnit: ITransUnit, translation: string) {
        transUnit.translate(translation);
    }

    /**
     * Add a new trans-unit.
     * @param transUnit
     */
    public addNewTransUnit(transUnit: ITransUnit) {
        let bodyElement = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'body');
        if (bodyElement) {
            bodyElement.appendChild(<Node>transUnit.asXmlElement());
            this.initializeTransUnits();
            this.transUnits.push(transUnit);
        }
    }

    /**
     * Remove the trans-unit with the given id.
     * @param id
     */
    public removeTransUnitWithId(id: string) {
        let tuNode: Node = this.xliffContent.getElementById(id);
        if (tuNode) {
            tuNode.parentNode.removeChild(tuNode);
            this.initializeTransUnits();
            this.transUnits = this.transUnits.filter((tu) => tu.id !== id);
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
     * The xml to be saved after changes are made.
     */
    public editedContent(): string {
        return new XMLSerializer().serializeToString(this.xliffContent);
    }

}