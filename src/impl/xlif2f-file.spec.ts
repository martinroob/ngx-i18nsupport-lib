import {TranslationMessagesFileFactory, ITranslationMessagesFile, ITransUnit, STATE_TRANSLATED} from '../api';
import * as fs from "fs";

/**
 * Created by martin on 05.05.2017.
 * Testcases for XLIFF 2.0 files.
 */

describe('ngx-i18nsupport-lib XLIFF 2.0 test spec', () => {

    let SRCDIR = 'test/testdata/i18n/';

    let ENCODING = 'UTF-8';

    /**
     * Helper function to read Xliff 2.0 from File
     * @type {string}
     */
    function readFile(path: string): ITranslationMessagesFile {
        const content = fs.readFileSync(path, ENCODING);
        return TranslationMessagesFileFactory.fromFileContent('xlf2', content, path, ENCODING);
    }

    describe('XLIFF 2.0 format tests', () => {
        let MASTER1SRC = SRCDIR + 'ngExtractedMaster1.xlf2';
        let TRANSLATED_FILE_SRC = SRCDIR + 'translatedFile.xlf2';

        let ID_APP_RUNS = '4371668001355139802'; // an ID from ngExtractedMaster1.xlf
        let ID_WITH_PLACEHOLDER = '9030312858648510700';
        let ID_WITH_REPEATED_PLACEHOLDER = '7049669989298349710';
        let ID_WITH_MEANING_AND_DESCRIPTION = '6830980354990918030';
        let ID_WITH_NO_SOURCEREFS = '4371668001355139802'; // an ID with no source elements
        let ID_WITH_ONE_SOURCEREF = 'TODO';
        let ID_WITH_TWO_SOURCEREFS = 'TODO'; // an ID with 2 source elements
        let ID_WITH_TAGS = '7609655310648429098';
        let ID_WITH_STRANGE_TAG = '7610784844464920497';

        it('should read xlf file', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file).toBeTruthy();
            expect(file.fileType()).toBe('XLIFF 2.0');
            const tu: ITransUnit = file.transUnitWithId(ID_APP_RUNS);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Anwendung läuft!');
        });

        it('should emit warnings', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.warnings().length).toBe(1);
            expect(file.warnings()[0]).toContain('trans-unit without "id"');
        });

        it('should count units', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.numberOfTransUnits()).toBe(26);
            expect(file.numberOfTransUnitsWithMissingId()).toBe(1);
        });

        it('should return source language', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.sourceLanguage()).toBe('de');
        });

        it('should return target language', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.targetLanguage()).toBeFalsy();
            const translatedFile: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            expect(translatedFile.targetLanguage()).toBe('en');
        });

        it('should loop over all trans units', () => {
            const translatedFile: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            let count = 0;
            translatedFile.forEachTransUnit((tu: ITransUnit) => {
                expect(tu).toBeTruthy();
                count++;
            });
            expect(count).toBeGreaterThan(24);
        });

        it('should read meaning and description of tu', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_MEANING_AND_DESCRIPTION);
            expect(tu).toBeTruthy();
            expect(tu.meaning()).toBe('dateservice.monday');
            expect(tu.description()).toBe('ngx-translate');
        });

        it('should return empty source references array if source not set', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_NO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(0);
        });

        it('should return source reference', () => {
            // TODO wait for sourceref support
/*            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_ONE_SOURCEREF);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(1);
            expect(tu.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[0].linenumber).toBe(10);*/
        });

        it('should return more than one source references', () => {
            // TODO wait for sourceref support
/*            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(2);
            expect(tu.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[0].linenumber).toBe(20);
            expect(tu.sourceReferences()[1].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[1].linenumber).toBe(21);*/
        });

        it('should not change source reference when translating', () => {
            // TODO wait for sourceref support
/*            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(2);
            tu.translate('a translated value');
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu2.targetContent()).toBe('a translated value');
            expect(tu2.sourceReferences().length).toBe(2);
            expect(tu2.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu2.sourceReferences()[0].linenumber).toBe(20);
            expect(tu2.sourceReferences()[1].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu2.sourceReferences()[1].linenumber).toBe(21);*/
        });

        it('should normalize placeholders to {{0}} etc', () => {
            const file: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu.targetContentNormalized().asDisplayString()).toBe('Entry {{0}} of total {{1}} added.');
        });

        it('should normalize repeated placeholders to {{0}} {{1}} etc', () => {
            const file: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_REPEATED_PLACEHOLDER);
            expect(tu.targetContentNormalized().asDisplayString()).toBe('{{0}}: A message with 2 placeholders: {{0}} {{1}}');
        });

        it('should normalize embedded html tags', () => {
            const file: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TAGS);
            expect(tu.targetContentNormalized().asDisplayString()).toBe('This message is <b><strong>VERY IMPORTANT</strong></b>');
        });

        it('should normalize unknown embedded html tags', () => {
            const file: ITranslationMessagesFile = readFile(TRANSLATED_FILE_SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_STRANGE_TAG);
            expect(tu.targetContentNormalized().asDisplayString()).toBe('This message is <strange>{{0}}</strange>');
        });

        it('should remove a transunit by id', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            file.removeTransUnitWithId(ID_WITH_PLACEHOLDER);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu2).toBeFalsy(); // should not exist any more
        });

        it ('should translate source without or with target', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_APP_RUNS);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            // first translate
            tu.translate('Anwendung läuft');
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_APP_RUNS);
            expect(tu2.targetContentNormalized().asDisplayString()).toBe('Anwendung läuft');
            expect(tu2.targetState()).toBe(STATE_TRANSLATED);
            // translate again
            tu2.translate('Anwendung funktioniert');
            const file3: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file2.editedContent(), null, null);
            const tu3: ITransUnit = file3.transUnitWithId(ID_APP_RUNS);
            expect(tu3.targetContentNormalized().asDisplayString()).toBe('Anwendung funktioniert');
            expect(tu3.targetState()).toBe(STATE_TRANSLATED);
        });

        it ('should copy source to target for default lang', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            let isDefaultLang: boolean = true;
            let copyContent: boolean = false;
            tu.useSourceAsTarget(isDefaultLang, copyContent);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu2.targetContentNormalized().asDisplayString()).toBe('Eintrag {{0}} von {{1}} hinzugefügt.');
        });

        it ('should copy source to target for non default lang if wanted', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            let isDefaultLang: boolean = false;
            let copyContent: boolean = true;
            tu.useSourceAsTarget(isDefaultLang, copyContent);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu2.targetContentNormalized().asDisplayString()).toBe('Eintrag {{0}} von {{1}} hinzugefügt.');
        });

        it ('should not copy source to target for non default lang if not wanted', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            let isDefaultLang: boolean = false;
            let copyContent: boolean = false;
            tu.useSourceAsTarget(isDefaultLang, copyContent);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu2.targetContent()).toBeFalsy();
        });
    });
});
