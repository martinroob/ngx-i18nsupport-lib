import {DOMParser, XMLSerializer} from "xmldom";
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {isNullOrUndefined, format} from 'util';
import {ITransUnit} from '../api/i-trans-unit';
import {DOMUtilities} from './dom-utilities';
import {XmbTransUnit} from './xmb-trans-unit';
/**
 * Created by martin on 10.03.2017.
 * xmb-File access.
 */

export class XmbFile implements ITranslationMessagesFile {

    private _filename: string;

    private _encoding: string;

    private xmbContent: Document;

    // trans-unit elements and their id from the file
    private transUnits: ITransUnit[];

    private _warnings: string[];
    private _numberOfTransUnitsWithMissingId: number;

    // attached master file, if any
    // used as source to determine state ...
    private _masterFile: XmbFile;

    /**
     * Create an xmb-File from source.
     * @param xmlString file content
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * @return {XmbFile}
     */
    constructor(xmlString: string, path: string, encoding: string, optionalMaster?: { xmlContent: string, path: string, encoding: string }) {
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding, optionalMaster);
    }

    private initializeFromContent(xmlString: string, path: string, encoding: string, optionalMaster?: { xmlContent: string, path: string, encoding: string }): XmbFile {
        this._filename = path;
        this._encoding = encoding;
        this.xmbContent = new DOMParser().parseFromString(xmlString, 'text/xml');
        if (this.xmbContent.getElementsByTagName('messagebundle').length !== 1) {
            throw new Error(format('File "%s" seems to be no xmb file (should contain a messagebundle element)', path));
        }
        if (optionalMaster) {
            this._masterFile = new XmbFile(optionalMaster.xmlContent, optionalMaster.path, optionalMaster.encoding);
            // TODO check, wether this can be the master ...
        }
        return this;
    }

    private initializeTransUnits() {
        if (isNullOrUndefined(this.transUnits)) {
            this.transUnits = [];
            let transUnitsInFile = this.xmbContent.getElementsByTagName('msg');
            for (let i = 0; i < transUnitsInFile.length; i++) {
                let msg = transUnitsInFile.item(i);
                let id = msg.getAttribute('id');
                if (!id) {
                    this._warnings.push(format('oops, msg without "id" found in master, please check file %s', this.filename));
                    this._numberOfTransUnitsWithMissingId++;
                }
                let masterUnit: ITransUnit = null;
                if (this._masterFile) {
                    masterUnit = this._masterFile.transUnitWithId(id);
                }
                this.transUnits.push(new XmbTransUnit(msg, id, masterUnit));
            }
        }
    }

    /**
     * File type.
     * Here 'XMB'
     */
    public fileType(): string {
        return 'XMB';
    }

    public forEachTransUnit(callback: ((transunit: ITransUnit) => void)) {
        this.initializeTransUnits();
        this.transUnits.forEach((tu) => callback(tu));
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
     * Guess language from filename.
     * If filename is foo.xy.xmb, than language is assumed to be xy.
     * @return {string} Language or null
     */
    private guessLanguageFromFilename(): string {
        if (this._filename) {
            let parts: string[] = this._filename.split('.');
            if (parts.length > 2 && parts[parts.length - 1].toLowerCase() === 'xmb') {
                return parts[parts.length - 2];
            }
        }
        return null;
    }

    /**
     * Get source language.
     * Unsupported in xmb.
     * Try to guess it from master filename if any..
     * @return {string}
     */
    public sourceLanguage(): string {
        if (this._masterFile) {
            return this._masterFile.guessLanguageFromFilename();
        } else {
            return null;
        }
    }

    /**
     * Edit the source language.
     * Unsupported in xmb.
     * @param language
     */
    public setSourceLanguage(language: string) {
        // do nothing, xmb has no notation for this.
    }

    /**
     * Get target language.
     * Unsupported in xmb.
     * Try to guess it from filename if any..
     * @return {string}
     */
    public targetLanguage(): string {
        return this.guessLanguageFromFilename();
    }

    /**
     * Edit the target language.
     * Unsupported in xmb.
     * @param language
     */
    public setTargetLanguage(language: string) {
        // do nothing, xmb has no notation for this.
    }

    /**
     * Copy source to target to use it as dummy translation.
     * (better than missing value)
     * In xmb there is nothing to do, because there is only a target, no source.
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
        let messagebundleElement = DOMUtilities.getFirstElementByTagName(this.xmbContent, 'messagebundle');
        if (messagebundleElement) {
            messagebundleElement.appendChild(<Node>transUnit.asXmlElement());
            this.initializeTransUnits();
            this.transUnits.push(transUnit);
        }
    }

    /**
     * Remove the trans-unit with the given id.
     * @param id
     */
    public removeTransUnitWithId(id: string) {
        this.xmbContent.getElementById(id).remove();
        this.initializeTransUnits();
        this.transUnits = this.transUnits.filter((tu) => tu.id !== id);
    }

    /**
     * The filename where the data is read from.
     */
    public filename(): string {
        return this._filename;
    }

    /**
     * The encoding of the xml content (UTF-8, ISO-8859-1, ...)
     */
    public encoding(): string {
        return this._encoding;
    }

    /**
     * The xml to be saved after changes are made.
     */
    public editedContent(): string {
        return new XMLSerializer().serializeToString(this.xmbContent);
    }

}