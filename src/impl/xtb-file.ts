import {DOMParser} from "xmldom";
import {ITranslationMessagesFile, ITransUnit, FILETYPE_XTB, FORMAT_XTB} from '../api';
import {format} from 'util';
import {DOMUtilities} from './dom-utilities';
import {AbstractTranslationMessagesFile} from './abstract-translation-messages-file';
import {XmbFile} from './xmb-file';
import {XtbTransUnit} from './xtb-trans-unit';
import {AbstractTransUnit} from './abstract-trans-unit';
/**
 * Created by martin on 23.05.2017.
 * xtb-File access.
 * xtb is the translated counterpart to xmb.
 */

export const XTB_DOCTYPE = `<!DOCTYPE translationbundle [
  <!ELEMENT translationbundle (translation)*>
  <!ATTLIST translationbundle lang CDATA #REQUIRED>
  <!ELEMENT translation (#PCDATA|ph)*>
  <!ATTLIST translation id CDATA #REQUIRED>
  <!ELEMENT ph EMPTY>
  <!ATTLIST ph name CDATA #REQUIRED>
]>`;

export class XtbFile extends AbstractTranslationMessagesFile implements ITranslationMessagesFile {

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

    private initializeFromContent(xmlString: string, path: string, encoding: string, optionalMaster?: { xmlContent: string, path: string, encoding: string }): XtbFile {
        this._filename = path;
        this._encoding = encoding;
        this._parsedDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
        if (this._parsedDocument.getElementsByTagName('translationbundle').length !== 1) {
            throw new Error(format('File "%s" seems to be no xtb file (should contain a translationbundle element)', path));
        }
        if (optionalMaster) {
            this._masterFile = new XmbFile(optionalMaster.xmlContent, optionalMaster.path, optionalMaster.encoding);
            // TODO check, wether this can be the master ...
        }
        return this;
    }

    protected initializeTransUnits() {
        this.transUnits = [];
        let transUnitsInFile = this._parsedDocument.getElementsByTagName('translation');
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
            this.transUnits.push(new XtbTransUnit(msg, id, this, <AbstractTransUnit> masterUnit));
        }
    }

    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xlf2', 'xmb', 'xtb'
     * Returns one of the constants FORMAT_..
     */
    public i18nFormat(): string {
        return FORMAT_XTB;
    }

    /**
     * File type.
     * Here 'XTB'
     */
    public fileType(): string {
        return FILETYPE_XTB;
    }

    /**
     * Get source language.
     * Unsupported in xmb/xtb.
     * Try to guess it from master filename if any..
     * @return {string}
     */
    public sourceLanguage(): string {
        if (this._masterFile) {
            return this._masterFile.sourceLanguage();
        } else {
            return null;
        }
    }

    /**
     * Edit the source language.
     * Unsupported in xmb/xtb.
     * @param language
     */
    public setSourceLanguage(language: string) {
        // do nothing, xtb has no notation for this.
    }

    /**
     * Get target language.
     * @return {string}
     */
    public targetLanguage(): string {
        const translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (translationbundleElem) {
            return translationbundleElem.getAttribute('lang');
        } else {
            return null;
        }
    }

    /**
     * Edit the target language.
     * @param language
     */
    public setTargetLanguage(language: string) {
        const translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (translationbundleElem) {
            translationbundleElem.setAttribute('lang', language);
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
     */
    public importNewTransUnit(transUnit: ITransUnit, isDefaultLang: boolean, copyContent: boolean) {
        if (this.transUnitWithId(transUnit.id)) {
            throw new Error(format('tu with id %s already exists in file, cannot import it', transUnit.id));
        }
        let newTu = (<AbstractTransUnit> transUnit).cloneWithSourceAsTarget(isDefaultLang, copyContent);
        let translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (translationbundleElem) {
            let translationElement = translationbundleElem.ownerDocument.createElement('translation');
            translationElement.setAttribute('id', transUnit.id);
            DOMUtilities.replaceContentWithXMLContent(translationElement, transUnit.sourceContent());
            let newTransUnit = new XtbTransUnit(translationElement, transUnit.id, this, newTu);
            translationbundleElem.appendChild(translationElement);
            this.lazyInitializeTransUnits();
            this.transUnits.push(newTransUnit);
            this.countNumbers();
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
        throw new Error(format('File "%s", xtb files are not translatable, they are already translations', filename));
    }
}