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
        let ID_WITH_PLACEHOLDER_2 = 'af0819ea4a5db68737ebcabde2f5e432b66352e8xxx'; // same with </x> tags
        let ID_WITH_MEANING_AND_DESCRIPTION = '84e8cd8ba480129d90f512cc3462bb43efcf389f';
        let ID_WITH_NO_SOURCEREFS = 'no_sourceref_test'; // an ID with no source elements
        let ID_WITH_ONE_SOURCEREF = '57e605bfa130afb4de4ee40e496e854a9e8a28a7';
        let ID_WITH_TWO_SOURCEREFS = '78eab955529ba0f1817c84991d9175f55bfdf937'; // an ID with 2 source elements
        let ID_WITH_TAGS = '7e8dd1fd1c57afafc38550ce80b5bcc1ced49f85';
        let ID_WITH_TAGS_2 = '7e8dd1fd1c57afafc38550ce80b5bcc1ced49f85xxx'; // same with </x> tags
        let ID_UNTRANSLATED_DESCRIPTION = 'a52ba049c16778bdb2e5a19a41acaadf87b104dc';

        it('should read xlf file', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file).toBeTruthy();
            expect(file.fileType()).toBe('XLIFF 1.2');
            const tu: ITransUnit = file.transUnitWithId(ID_TRANSLATED_SCHLIESSEN);
            expect(tu).toBeTruthy();
            expect(tu.sourceContent()).toBe('Schließen');
        });

        it('should emit warnings', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.warnings().length).toBe(1);
            expect(file.warnings()[0]).toContain('trans-unit without "id"');
        });

        it('should count units', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            expect(file.numberOfTransUnits()).toBe(14);
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

        it('should return empty source references array if source not set', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_NO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(0);
        });

        it('should return source reference', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_ONE_SOURCEREF);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(1);
            expect(tu.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[0].linenumber).toBe(10);
        });

        it('should return more than one source references', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu).toBeTruthy();
            expect(tu.sourceReferences().length).toBe(2);
            expect(tu.sourceReferences()[0].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[0].linenumber).toBe(20);
            expect(tu.sourceReferences()[1].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu.sourceReferences()[1].linenumber).toBe(21);
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
            expect(tu2.sourceReferences()[0].linenumber).toBe(20);
            expect(tu2.sourceReferences()[1].sourcefile).toBe('S:/experimente/sampleapp41/src/app/app.component.ts');
            expect(tu2.sourceReferences()[1].linenumber).toBe(21);
        });

        it('should normalize placeholders to {{0}} etc', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER);
            expect(tu.targetContentNormalized()).toBe('Eintrag {{0}} von {{1}} hinzugefügt.');
            const tu2: ITransUnit = file.transUnitWithId(ID_WITH_PLACEHOLDER_2);
            expect(tu2.targetContentNormalized()).toBe('Eintrag {{0}} von {{1}} hinzugefügt.');
        });

        it('should normalize embedded html tags', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TAGS);
            expect(tu.targetContentNormalized()).toBe('Dieser Text enthält <b>eingebettetes html</b>');
            const tu2: ITransUnit = file.transUnitWithId(ID_WITH_TAGS_2);
            expect(tu2.targetContentNormalized()).toBe('Dieser Text enthält <b>eingebettetes html</b>');
        });

        it('should remove a transunit by id', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu).toBeTruthy();
            file.removeTransUnitWithId(ID_WITH_TWO_SOURCEREFS);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_WITH_TWO_SOURCEREFS);
            expect(tu2).toBeFalsy(); // should not exist any more
        });

        it ('should translate source without or with target', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_TRANSLATED_SCHLIESSEN);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            let isDefaultLang: boolean = false;
            let copyContent: boolean = true;
            // first translate
            tu.translate('Anwendung läuft');
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_TRANSLATED_SCHLIESSEN);
            expect(tu2.targetContentNormalized()).toBe('Anwendung läuft');
            expect(tu2.targetState()).toBe('final');
            // translate again
            tu2.translate('Anwendung funktioniert');
            const file3: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file2.editedContent(), null, null);
            const tu3: ITransUnit = file3.transUnitWithId(ID_TRANSLATED_SCHLIESSEN);
            expect(tu3.targetContentNormalized()).toBe('Anwendung funktioniert');
            expect(tu3.targetState()).toBe('final');
        });

        it ('should copy source to target for default lang', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_UNTRANSLATED_DESCRIPTION);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            let isDefaultLang: boolean = true;
            let copyContent: boolean = false;
            tu.useSourceAsTarget(isDefaultLang, copyContent);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_UNTRANSLATED_DESCRIPTION);
            expect(tu2.targetContentNormalized()).toBe('Beschreibung zu {{0}} ({{1}})');
        });

        it ('should copy source to target for non default lang if wanted', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_UNTRANSLATED_DESCRIPTION);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            let isDefaultLang: boolean = false;
            let copyContent: boolean = true;
            tu.useSourceAsTarget(isDefaultLang, copyContent);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_UNTRANSLATED_DESCRIPTION);
            expect(tu2.targetContentNormalized()).toBe('Beschreibung zu {{0}} ({{1}})');
        });

        it ('should not copy source to target for non default lang if not wanted', () => {
            const file: ITranslationMessagesFile = readFile(MASTER1SRC);
            const tu: ITransUnit = file.transUnitWithId(ID_UNTRANSLATED_DESCRIPTION);
            expect(tu).toBeTruthy();
            expect(tu.targetContent()).toBeFalsy();
            let isDefaultLang: boolean = false;
            let copyContent: boolean = false;
            tu.useSourceAsTarget(isDefaultLang, copyContent);
            const file2: ITranslationMessagesFile = TranslationMessagesFileFactory.fromUnknownFormatFileContent(file.editedContent(), null, null);
            const tu2: ITransUnit = file2.transUnitWithId(ID_UNTRANSLATED_DESCRIPTION);
            expect(tu2.targetContent()).toBeFalsy();
        });
    });
});
