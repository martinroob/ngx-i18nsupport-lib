import {TranslationMessagesFileFactory, ITranslationMessagesFile, ITransUnit} from '../api';
import * as fs from "fs";

/**
 * Created by martin on 28.04.2017.
 * Testcases for xliff 1.2 files.
 */

describe('ngx-i18nsupport-lib xliff 1.2 test spec', () => {

    let SRCDIR = 'test/testdata/i18n/';

    let ENCODING = 'UTF-8';

    /**
     * Helper function to read Xliff from File
     * @type {string}
     */
    function readFile(path: string): ITranslationMessagesFile {
        const content = fs.readFileSync(path, ENCODING);
        return TranslationMessagesFileFactory.fromFileContent('xlf', content, path, ENCODING);
    }

    describe('xlf 1.2 format tests', () => {
        let MASTER1SRC = SRCDIR + 'ngExtractedMaster1.xlf';
        let TRANSLATED_FILE_SRC = SRCDIR + 'translatedFile.xlf';

        let ID_TRANSLATED_SCHLIESSEN = '1ead0ad1063d0c9e005fe56c9529aef4c1ef9d21'; // an ID from ngExtractedMaster1.xlf
        let ID_WITH_PLACEHOLDER = 'af0819ea4a5db68737ebcabde2f5e432b66352e8';
        let ID_WITH_MEANING_AND_DESCRIPTION = '84e8cd8ba480129d90f512cc3462bb43efcf389f';

        it('should read xlf file', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file).toBeTruthy();
            expect(file.fileType()).toBe('XLIFF 1.2');
            const tu: ITransUnit = file.transUnitWithId(ID_TRANSLATED_SCHLIESSEN);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Schlie&#xDF;en');
        });

        it('should emit warnings', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.warnings().length).toBe(1);
            expect(file.warnings()[0]).toContain('trans-unit without "id"');
        });

        it('should count units', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.numberOfTransUnits()).toBe(11);
            expect(file.numberOfTransUnitsWithMissingId()).toBe(1);
        });

        it('should return source language', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.sourceLanguage()).toBe('en');
        });

        it('should return target language', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.targetLanguage()).toBeFalsy();
            const translatedFile: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            expect(translatedFile.targetLanguage()).toBe('de');
        });

        it('should loop over all trans units', () => {
            const translatedFile: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            let count = 0;
            translatedFile.forEachTransUnit((tu: ITransUnit) => {
                expect(tu).toBeTruthy();
                count++;
            });
            expect(count).toBeGreaterThan(30);
        });

        it('should read meaning and description of tu', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_MEANING_AND_DESCRIPTION);
            expect(tu).toBeTruthy();
            expect(tu.meaning()).toBe('dateservice.monday');
            expect(tu.description()).toBe('ngx-translate');
        });

    });
});
