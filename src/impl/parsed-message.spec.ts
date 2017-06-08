import {Xliff2MessageParser} from './xliff2-message-parser';
import {ParsedMessage} from './parsed-message';
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
    });

});