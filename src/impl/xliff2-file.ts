import * as Constants from '../api/constants';
import {DOMParser, XMLSerializer} from "xmldom";
import {isNullOrUndefined, format} from 'util';
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {ITransUnit} from '../api/i-trans-unit';
import {DOMUtilities} from './dom-utilities';
import {Xliff2TransUnit} from './xliff2-trans-unit';
/**
 * Created by martin on 04.05.2017.
 * An XLIFF 2.0 file read from a source file.
 * Format definition is: http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 * Defines some relevant get and set method for reading and modifying such a file.
 */

export class Xliff2File implements ITranslationMessagesFile {

    private _filename: string;

    private _encoding: string;

    private xliffContent: Document;

    // trans-unit elements and their id from the file
    private transUnits: ITransUnit[];

    private _warnings: string[];
    private _numberOfTransUnitsWithMissingId: number;

    /**
     * Create an XLIFF 2.0-File from source.
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

    private initializeFromContent(xmlString: string, path: string, encoding: string): Xliff2File {
        this._filename = path;
        this._encoding = encoding;
        this.xliffContent = new DOMParser().parseFromString(xmlString, 'text/xml');
        const xliffList = this.xliffContent.getElementsByTagName('xliff');
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
     * File type.
     * Here 'XLIFF 2.0'
     */
    public fileType(): string {
        return Constants.FILETYPE_XLIFF20;
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
            let transUnitsInFile = this.xliffContent.getElementsByTagName('unit');
            for (let i = 0; i < transUnitsInFile.length; i++) {
                let transunit = transUnitsInFile.item(i);
                let id = transunit.getAttribute('id');
                if (!id) {
                    this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
                    this._numberOfTransUnitsWithMissingId++;
                }
                this.transUnits.push(new Xliff2TransUnit(transunit, id));
            }
        }
    }

    /**
     * Get source language.
     * @return {string}
     */
    public sourceLanguage(): string {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'xliff');
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
        const xliffElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('srcLang', language);
        }
    }

    /**
     * Get target language.
     * @return {string}
     */
    public targetLanguage(): string {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'xliff');
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
        const xliffElem = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('trgLang', language);
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
        let fileElement = DOMUtilities.getFirstElementByTagName(this.xliffContent, 'file');
        if (fileElement) {
            fileElement.appendChild(<Node>transUnit.asXmlElement());
            this.initializeTransUnits();
            this.transUnits.push(transUnit);
        } else {
            throw new Error(format('File "%s" seems to be no xliff 2.0 file (should contain a file element)', this._filename));
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