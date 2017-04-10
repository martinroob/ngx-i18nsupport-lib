import {TranslationMessagesFileFactory, ITranslationMessagesFile, ITransUnit} from '.';

/**
 * Created by martin on 10.04.2017.
 * Testcases for public API.
 */

describe('ngx-i18nsupport-lib API test spec', () => {

    /**
     * Workdir, not in git.
     * Cleaned up for every test.
     * Tests, that work on files, copy everything they need into this directory.
     * @type {string}
     */
    let WORKDIR = 'test/work/';
    let SRCDIR = 'test/testdata/i18n/';

    let ENCODING = 'UTF-8';

    /**
     * Helper function to read Xliff from File
     * @type {string}
     */
    function readXliff(path: string): ITranslationMessagesFile {
        return null; // TODO
        //return TranslationMessagesFileReader.fromFile('xlf', path, ENCODING);
    }

    /**
     * Helper function to read Xmb from File
     * @type {string}
     */
    function readXmb(path: string): ITranslationMessagesFile {
        return null; // TODO
        // return TranslationMessagesFileReader.fromFile('xmb', path, ENCODING);
    }

    /**
     * Helper function to read Xmb from 2 Files, the xmb and the master
     * @type {string}
     */
    function readXmbWithMaster(path: string, masterPath: string): ITranslationMessagesFile {
        return null; // TODO
        //return TranslationMessagesFileReader.fromFile('xmb', path, ENCODING, masterPath);
    }

    describe('first test', () => {
       it('should pass', () => {
           expect(true).toBeTruthy();
       })
    });
});
