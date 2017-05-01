import {TranslationMessagesFileFactory, ITranslationMessagesFile, ITransUnit} from '../api';
import * as fs from "fs";

/**
 * Created by martin on 28.04.2017.
 * Testcases for xmb files.
 */

describe('ngx-i18nsupport-lib xmb test spec', () => {

    let SRCDIR = 'test/testdata/i18n/';

    let ENCODING = 'UTF-8';

    /**
     * Helper function to read Xmb from File
     * @type {string}
     */
    function readFile(path: string): ITranslationMessagesFile {
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

    describe('xmb format tests', () => {
        let MASTER1SRC = SRCDIR + 'ngExtractedMaster1.xmb';
        let MASTER_DE_XMB = SRCDIR + 'ngExtractedMaster1.de.xmb';
        let MASTER_EN_XMB = SRCDIR + 'ngExtractedMaster1.en.xmb';

        let ID_MY_FIRST = '2047558209369508311'; // an ID from ngExtractedMaster1.xmb
        let ID_WITH_PLACEHOLDER = '9030312858648510700';
        let ID_WITH_MEANING_AND_DESCRIPTION = '3274258156935474372'; // ID with placeholders and source element
        let ID_WITH_NO_SOURCEREFS = 'no_sourceref_test'; // an ID with no source elements
        let ID_WITH_TWO_SOURCEREFS = '4371668001355139802'; // an ID with 2 source elements
        let ID_WITH_LINEBREAK = '7149517499881679376';

        it('should read xmb file', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file).toBeTruthy();
            expect(file.fileType()).toBe('XMB');
            const tu: ITransUnit = file.transUnitWithId(ID_MY_FIRST);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Meine erste I18N-Anwendung');
        });

        it('should emit warnings', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.warnings().length).toBe(1);
            expect(file.warnings()[0]).toContain('msg without "id"');
        });

        it('should count units', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.numberOfTransUnits()).toBe(8);
            expect(file.numberOfTransUnitsWithMissingId()).toBe(1);
        });

        it('should return source language', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.sourceLanguage()).toBeFalsy();
            const file2: ITranslationMessagesFile = readXmbWithMaster(MASTER_DE_XMB, MASTER_EN_XMB);
            expect(file2.sourceLanguage()).toBe('en');
        });

        it('should return target language', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.targetLanguage()).toBeFalsy();
            const translatedFile: ITranslationMessagesFile = readXmbWithMaster(MASTER_EN_XMB, MASTER_DE_XMB);
            expect(translatedFile.targetLanguage()).toBe('en');
        });

        it('should loop over all trans units', () => {
            const translatedFile: ITranslationMessagesFile = readFile(MASTER_DE_XMB);
            let count = 0;
            translatedFile.forEachTransUnit((tu: ITransUnit) => {
                expect(tu).toBeTruthy();
                count++;
            });
            expect(count).toBeGreaterThan(4);
        });

        it('should read meaning and description of tu', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_MEANING_AND_DESCRIPTION);
            expect(tu).toBeTruthy();
            expect(tu.meaning()).toBe('dateservice.monday');
            expect(tu.description()).toBe('ngx-translate');
        });

        it('should ignore source attribute in sourceContent', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Eintrag <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph> von <ph name="INTERPOLATION_1"><ex>INTERPOLATION_1</ex></ph> hinzugef&#xFC;gt.');
        });

        it('should return empty source references array if source not set', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_NO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(0);
        });

        it('should return source reference', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(1);
            expect(tu.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[0].linenumber).toBe(6);
        });

        it('should return more than one source references', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(2);
            expect(tu.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[0].linenumber).toBe(2);
            expect(tu.sourceReferences()[1].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[1].linenumber).toBe(3);
        });

        it('should return source reference with more than 1 linenumber', () => {
            // if the text in template spreads over more than 1 line, there is a linenumber format like 7,8 used
            // in this case, linenumber is the first line (here 7).
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_LINEBREAK);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(1);
            expect(tu.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[0].linenumber).toBe(7);
        });

        it('should not change source reference when translating', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(2);
            tu.translate('a translated value');
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu2.targetContent()).toBe('a translated value');
            expect(tu2.sourceReferences().length).toBe(2);
            expect(tu2.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu2.sourceReferences()[0].linenumber).toBe(2);
            expect(tu2.sourceReferences()[1].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu2.sourceReferences()[1].linenumber).toBe(3);
        });

    });
});
