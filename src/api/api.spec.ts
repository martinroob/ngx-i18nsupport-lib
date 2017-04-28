import {TranslationMessagesFileFactory, ITranslationMessagesFile, ITransUnit} from '.';
import * as fs from "fs";

/**
 * Created by martin on 10.04.2017.
 * Testcases for public API.
 * Just reading different file formats.
 * Detail Tests are in the files for the specific formats.
 */

describe('ngx-i18nsupport-lib API test spec', () => {

    let SRCDIR = 'test/testdata/i18n/';

    let ENCODING = 'UTF-8';

    /**
     * Helper function to read Xliff from File
     * @type {string}
     */
    function readXliff(path: string): ITranslationMessagesFile {
        const content = fs.readFileSync(path, ENCODING);
        return TranslationMessagesFileFactory.fromFileContent('xlf', content, path, ENCODING);
    }

    /**
     * Helper function to read Xmb from File
     * @type {string}
     */
    function readXmb(path: string): ITranslationMessagesFile {
        const content = fs.readFileSync(path, ENCODING);
        return TranslationMessagesFileFactory.fromFileContent('xmb', content, path, ENCODING);
    }

    /**
     * Helper function to read Xmb from 2 Files, the xmb and the master
     * @type {string}
     */
    function readXmbWithMaster(path: string, masterPath: string): ITranslationMessagesFile {
        const content = fs.readFileSync(path, ENCODING);
        if (masterPath) {
            const masterContent = fs.readFileSync(masterPath, ENCODING);
            let optionalMaster = {xmlContent: masterContent, path: masterPath, encoding: ENCODING};
            return TranslationMessagesFileFactory.fromFileContent('xmb', content, path, ENCODING, optionalMaster);
        } else {
            return TranslationMessagesFileFactory.fromFileContent('xmb', content, path, ENCODING);
        }
    }

    /**
     * Helper function to read translation file of any format
     * @type {string}
     */
    function readFile(path: string, masterPath?: string): ITranslationMessagesFile {
        const content = fs.readFileSync(path, ENCODING);
        if (masterPath) {
            const masterContent = fs.readFileSync(masterPath, ENCODING);
            const optionalMaster = {xmlContent: masterContent, path: masterPath, encoding: ENCODING};
            return TranslationMessagesFileFactory.fromUnknownFormatFileContent(content, path, ENCODING, optionalMaster);
        } else {
            return TranslationMessagesFileFactory.fromUnknownFormatFileContent(content, path, ENCODING);
        }
    }

    describe('api tests', () => {
        let MASTER1SRC_XLIFF = SRCDIR + 'ngExtractedMaster1.xlf';
        let TRANSLATED_FILE_SRC_XLIFF = SRCDIR + 'translatedFile.xlf';
        let MASTER1SRC_XMB = SRCDIR + 'ngExtractedMaster1.xmb';
        let MASTER_DE_XMB = SRCDIR + 'ngExtractedMaster1.de.xmb';
        let MASTER_EN_XMB = SRCDIR + 'ngExtractedMaster1.en.xmb';

        it('should read xlf file', () => {
            const file: ITranslationMessagesFile = readXliff(MASTER1SRC_XLIFF);
            expect(file).toBeTruthy();
            expect(file.fileType()).toBe('XLIFF 1.2');
        });

        it('should read xmb file', () => {
            const file: ITranslationMessagesFile = readXmb(MASTER1SRC_XMB);
            expect(file).toBeTruthy();
            expect(file.fileType()).toBe('XMB');
        });

        it('should read xmb file with master', () => {
            const file: ITranslationMessagesFile = readXmbWithMaster(MASTER_EN_XMB, MASTER_DE_XMB);
            expect(file).toBeTruthy();
            expect(file.fileType()).toBe('XMB');
            expect(file.sourceLanguage()).toBe('de');
            expect(file.targetLanguage()).toBe('en');
        });

        it('should autodetect file format', () => {
            const file1: ITranslationMessagesFile = readFile(MASTER1SRC_XLIFF);
            expect(file1).toBeTruthy();
            expect(file1.fileType()).toBe('XLIFF 1.2');
            const file2: ITranslationMessagesFile = readFile(MASTER1SRC_XMB);
            expect(file2).toBeTruthy();
            expect(file2.fileType()).toBe('XMB');
            const file3: ITranslationMessagesFile = readFile(MASTER_DE_XMB, MASTER_EN_XMB);
            expect(file3).toBeTruthy();
            expect(file3.fileType()).toBe('XMB');
        });

    });
});
