import {Xliff2MessageParser} from './xliff2-message-parser';
import {ParsedMessage} from './parsed-message';
import {INormalizedMessage} from '../api/i-normalized-message';
/**
 * Created by martin on 17.05.2017.
 * Testcases for parsed messages.
 */

describe('normalized message test spec', () => {

    /**
     * Helperfunction to create a parsed message from normalized string.
     * @param normalizedString
     * @param sourceMessage
     * @return {ParsedMessage}
     */
    function parsedMessageFor(normalizedString: string, sourceMessage?: ParsedMessage): ParsedMessage {
        let parser = new Xliff2MessageParser(); // parser does not matter here, every format should be the same.
        return parser.parseNormalizedString(normalizedString, sourceMessage);
    }

    /**
     * Helperfunction to create an ICU Message.
     * @param icuMessageString
     * @param sourceMessage
     * @return {ParsedMessage}
     */
    function parsedICUMessage(icuMessageString: string, sourceMessage?: ParsedMessage): ParsedMessage {
        let parser = new Xliff2MessageParser(); // parser does not matter here, every format should be the same.
        return parser.parseICUMessage(icuMessageString, sourceMessage);
    }

    describe('validation test cases ', () => {

        it('should find nothing wrong with simple text message', () => {
            let translation = 'a text without anything special';
            let parsedMessage = parsedMessageFor(translation);
            expect(parsedMessage.validate()).toBeFalsy();
            expect(parsedMessage.validateWarnings()).toBeFalsy();
        });

        it('should find nothing wrong with simple text as translation of simple text', () => {
            let original = 'any text';
            let translation = 'a text without anything special';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validate()).toBeFalsy();
            expect(translatedMessage.validateWarnings()).toBeFalsy();
        });

        it('should warn if you remove a placeholder in the translation', () => {
            let original = 'a text with placeholder: {{0}}';
            let translation = 'a text without anything special';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validate()).toBeFalsy();
            const warnings = translatedMessage.validateWarnings();
            expect(warnings).toBeTruthy();
            expect(warnings.placeholderRemoved).toBe('removed placeholder 0 from original messages');
        });

        it('should report an error if you add a new placeholder in the translation', () => {
            let original = 'a text with placeholder: {{0}}';
            let translation = 'a text with 2 placeholders: {{0}} and {{1}}';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validateWarnings()).toBeFalsy();
            const errors = translatedMessage.validate();
            expect(errors).toBeTruthy();
            expect(errors.placeholderAdded).toBe('added placeholder 1, which is not in original message');
        });

        it('should not report an error if you duplicate a placeholder in the translation', () => {
            let original = 'a text with placeholder: {{0}}';
            let translation = 'a text with a duplicated placeholders: {{0}} and {{0}}';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validate()).toBeFalsy();
            expect(translatedMessage.validateWarnings()).toBeFalsy();
        });

        it('should warn if you remove a tag in the translation', () => {
            let original = 'a <b>bold</b> text';
            let translation = 'a non bold text';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validate()).toBeFalsy();
            const warnings = translatedMessage.validateWarnings();
            expect(warnings).toBeTruthy();
            expect(warnings.tagRemoved).toBe('removed tag <b> from original messages');
        });

        it('should warn if you add a tag in the translation', () => {
            let original = 'a normal text';
            let translation = 'a <strange>text</strange>';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validate()).toBeFalsy();
            const warnings = translatedMessage.validateWarnings();
            expect(warnings).toBeTruthy();
            expect(warnings.tagAdded).toBe('added tag <strange>, which is not in original message');
        });

        it('should find nothing wrong with text containing line breaks', () => {
            let translation = 'a text without\na line break';
            let parsedMessage = parsedMessageFor(translation);
            expect(parsedMessage.asDisplayString()).toBe(translation);
            expect(parsedMessage.validate()).toBeFalsy();
            expect(parsedMessage.validateWarnings()).toBeFalsy();
        });

        it('should report an error if you remove an ICU ref in the translation', () => {
            let original = 'a text with <ICU-Message-Ref_0/>';
            let translation = 'a text without icu-ref';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validateWarnings()).toBeFalsy();
            const errors = translatedMessage.validate();
            expect(errors).toBeTruthy();
            expect(errors.icuMessageRefRemoved).toBe('removed ICU message reference 0 from original messages');
        });

        it('should report an error if you add an ICU ref in the translation', () => {
            let original = 'a text with <ICU-Message-Ref_0/>';
            let translation = 'a text with <ICU-Message-Ref_0/> and  <ICU-Message-Ref_1/>';
            let sourceMessage = parsedMessageFor(original);
            let translatedMessage = sourceMessage.translate(translation);
            expect(translatedMessage.validateWarnings()).toBeFalsy();
            const errors = translatedMessage.validate();
            expect(errors).toBeTruthy();
            expect(errors.icuMessageRefAdded).toBe('added ICU message reference 1, which is not in original message');
        });

        it('should parse ICU plural message', () => {
            let original = '{n, plural, =0 {kein Schaf} =1 {ein Schaf} other {Schafe}}';
            let sourceICUMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            expect(sourceICUMessage.getICUMessage()).toBeTruthy();
            expect(sourceICUMessage.getICUMessage().isPluralMessage()).toBeTruthy();
            expect(sourceICUMessage.getICUMessage().getCategories().length).toBe(3);
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getCategory()).toBe('=0');
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getMessageNormalized().asDisplayString()).toBe('kein Schaf');
            expect(sourceICUMessage.getICUMessage().asNativeString()).toBe('{VAR_PLURAL, plural, =0 {kein Schaf} =1 {ein Schaf} other {Schafe}}');
        });

        it('should parse ICU select message', () => {
            let original = '{gender, select, m {männlich} f {weiblich}}';
            let sourceICUMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            expect(sourceICUMessage.getICUMessage()).toBeTruthy();
            expect(sourceICUMessage.getICUMessage().isPluralMessage()).toBeFalsy();
            expect(sourceICUMessage.getICUMessage().getCategories().length).toBe(2);
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getCategory()).toBe('m');
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getMessageNormalized().asDisplayString()).toBe('männlich');
            expect(sourceICUMessage.getICUMessage().asNativeString()).toBe('{VAR_SELECT, select, m {männlich} f {weiblich}}');
        });

        it('should parse ICU select message with select or plural in message text', () => {
            let original = '{VAR_SELECT, select, wert0 {value0 selected} wert1 {plural selected} wert2 {anything else selected} }';
            let sourceICUMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            expect(sourceICUMessage.getICUMessage()).toBeTruthy();
            expect(sourceICUMessage.getICUMessage().isPluralMessage()).toBeFalsy();
            expect(sourceICUMessage.getICUMessage().getCategories().length).toBe(3);
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getCategory()).toBe('wert0');
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getMessageNormalized().asDisplayString()).toBe('value0 selected');
        });

        it('should parse ICU select message with masked } {', () => {
            let original = '{VAR_SELECT, select, wert0 {value0 \'}\'\'\'\'{\'}}';
            let sourceICUMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            expect(sourceICUMessage.getICUMessage()).toBeTruthy();
            expect(sourceICUMessage.getICUMessage().isPluralMessage()).toBeFalsy();
            expect(sourceICUMessage.getICUMessage().getCategories().length).toBe(1);
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getCategory()).toBe('wert0');
            expect(sourceICUMessage.getICUMessage().getCategories()[0].getMessageNormalized().asDisplayString()).toBe('value0 }\'{');
        });

        it('should translate ICU plural message', () => {
            let original = '{n, plural, =0 {kein Schaf} =1 {ein Schaf} other {Schafe}}';
            let sourceICUMessage: INormalizedMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            let translatedICUMessage = sourceICUMessage.translateICUMessage({
                '=0': 'no sheep',
                '=1': 'one sheep',
                'other': 'sheep'
            });
            expect(translatedICUMessage.asNativeString()).toBe('{VAR_PLURAL, plural, =0 {no sheep} =1 {one sheep} other {sheep}}');
        });

        it('should translate ICU plural message with new categories', () => {
            let original = '{n, plural, =0 {kein Schaf} =1 {ein Schaf} other {Schafe}}';
            let sourceICUMessage: INormalizedMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            let translatedICUMessage = sourceICUMessage.translateICUMessage({
                '=0': 'no sheep',
                'many': 'a lot of sheep'
            });
            expect(translatedICUMessage.asNativeString()).toBe('{VAR_PLURAL, plural, =0 {no sheep} =1 {ein Schaf} other {Schafe} many {a lot of sheep}}');
        });

        it('should throw an error when translation of ICU plural message adds invalid category', () => {
            let original = '{n, plural, =0 {kein Schaf} =1 {ein Schaf} other {Schafe}}';
            let sourceICUMessage: INormalizedMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            try {
                let translatedICUMessage = sourceICUMessage.translateICUMessage({
                    '=0': 'no sheep',
                    'verdammtviele': 'a lot of sheep'
                });
                expect('').toBe('should have thrown an error "invalid category"');
            } catch (error) {
                expect(error.toString()).toBe('Error: invalid plural category "verdammtviele", allowed are =<n> and zero,one,two,few,many,other');
            }
        });

        it('should translate ICU select message', () => {
            let original = '{gender, select, m {männlich} f {weiblich}}';
            let sourceICUMessage: INormalizedMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            let translatedICUMessage = sourceICUMessage.translateICUMessage({
                'm': 'male',
                'f': 'female'
            });
            expect(translatedICUMessage.asNativeString()).toBe('{VAR_SELECT, select, m {male} f {female}}');
        });

        it('should partially translate ICU select message', () => {
            let original = '{gender, select, m {männlich} f {weiblich}}';
            let sourceICUMessage: INormalizedMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            // only translate one part of message
            let translatedICUMessage = sourceICUMessage.translateICUMessage({
                'f': 'female'
            });
            expect(translatedICUMessage.asNativeString()).toBe('{VAR_SELECT, select, m {männlich} f {female}}');
        });

        it('should throw an error if translation of ICU select message contains additional categories', () => {
            let original = '{gender, select, m {männlich} f {weiblich}}';
            let sourceICUMessage: INormalizedMessage = parsedICUMessage(original);
            expect(sourceICUMessage).toBeTruthy();
            try {
                // a category not part of the message
                let translatedICUMessage = sourceICUMessage.translateICUMessage({
                    'u': 'unknown'
                });
                expect('').toBe('should have thrown an error "unknown category"');
            } catch (error) {
                expect(error.toString()).toBe('Error: adding a new category not allowed for select messages ("u" is not part of message)');
            }
        });

    });

});