import {DOMParser} from "xmldom";
import {format} from 'util';
import {ITranslationMessagesFile, ITransUnit} from '../api';
import * as Constants from '../api/constants';
import {DOMUtilities} from './dom-utilities';
import {XliffTransUnit} from './xliff-trans-unit';
import {AbstractTranslationMessagesFile} from './abstract-translation-messages-file';
/**
 * Created by martin on 23.02.2017.
 * Ab xliff file read from a source file.
 * Defines some relevant get and set method for reading and modifying such a file.
 */

export class XliffFile extends AbstractTranslationMessagesFile implements ITranslationMessagesFile {

    /**
     * Create an xlf-File from source.
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

    private initializeFromContent(xmlString: string, path: string, encoding: string): XliffFile {
        this._filename = path;
        this._encoding = encoding;
        this._parsedDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
        const xliffList = this._parsedDocument.getElementsByTagName('xliff');
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
        return Constants.FILETYPE_XLIFF12;
    }

    protected initializeTransUnits() {
        this.transUnits = [];
        let transUnitsInFile = this._parsedDocument.getElementsByTagName('trans-unit');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            let transunit = transUnitsInFile.item(i);
            let id = transunit.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new XliffTransUnit(transunit, id, this));
        }
    }

    /**
     * Get source language.
     * @return {string}
     */
    public sourceLanguage(): string {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
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
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            fileElem.setAttribute('source-language', language);
        }
    }

    /**
     * Get target language.
     * @return {string}
     */
    public targetLanguage(): string {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
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
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            fileElem.setAttribute('target-language', language);
        }
    }

    /**
     * Add a new trans-unit.
     * @param transUnit
     */
    public addNewTransUnit(transUnit: ITransUnit) {
        let bodyElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'body');
        if (bodyElement) {
            bodyElement.appendChild(<Node>transUnit.asXmlElement());
            this.lazyInitializeTransUnits();
            this.transUnits.push(transUnit);
            this.countNumbers();
        }
    }

}