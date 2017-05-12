import {DOMParser} from "xmldom";
import {ITranslationMessagesFile, ITransUnit, FORMAT_XMB, FILETYPE_XMB} from '../api';
import {format} from 'util';
import {DOMUtilities} from './dom-utilities';
import {XmbTransUnit} from './xmb-trans-unit';
import {AbstractTranslationMessagesFile} from './abstract-translation-messages-file';
/**
 * Created by martin on 10.03.2017.
 * xmb-File access.
 */

export class XmbFile extends AbstractTranslationMessagesFile implements ITranslationMessagesFile {

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
        super();
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding, optionalMaster);
    }

    private initializeFromContent(xmlString: string, path: string, encoding: string, optionalMaster?: { xmlContent: string, path: string, encoding: string }): XmbFile {
        this._filename = path;
        this._encoding = encoding;
        this._parsedDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
        if (this._parsedDocument.getElementsByTagName('messagebundle').length !== 1) {
            throw new Error(format('File "%s" seems to be no xmb file (should contain a messagebundle element)', path));
        }
        if (optionalMaster) {
            this._masterFile = new XmbFile(optionalMaster.xmlContent, optionalMaster.path, optionalMaster.encoding);
            // TODO check, wether this can be the master ...
        }
        return this;
    }

    protected initializeTransUnits() {
        this.transUnits = [];
        let transUnitsInFile = this._parsedDocument.getElementsByTagName('msg');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            let msg = transUnitsInFile.item(i);
            let id = msg.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, msg without "id" found in master, please check file %s', this._filename));
            }
            let masterUnit: ITransUnit = null;
            if (this._masterFile) {
                masterUnit = this._masterFile.transUnitWithId(id);
            }
            this.transUnits.push(new XmbTransUnit(msg, id, this, masterUnit));
        }
    }

    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    public i18nFormat(): string {
        return FORMAT_XMB;
    }

    /**
     * File type.
     * Here 'XMB'
     */
    public fileType(): string {
        return FILETYPE_XMB;
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
     * Add a new trans-unit.
     * @param transUnit
     */
    public addNewTransUnit(transUnit: ITransUnit) {
        let messagebundleElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'messagebundle');
        if (messagebundleElement) {
            messagebundleElement.appendChild(<Node>(<XmbTransUnit> transUnit).asXmlElement());
            this.lazyInitializeTransUnits();
            this.transUnits.push(transUnit);
            this.countNumbers();
        }
    }

}