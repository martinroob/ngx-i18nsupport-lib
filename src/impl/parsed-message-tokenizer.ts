import * as Tokenizr from 'tokenizr';

/**
 * Created by martin on 14.05.2017.
 * A tokenizer for normalized messages.
 */

// Tokens
export const TEXT = 'TEXT';
export const START_TAG = 'START_TAG';
export const END_TAG = 'END_TAG';
export const PLACEHOLDER = 'PLACEHOLDER';
export const ICU_MESSAGE_REF = 'ICU_MESSAGE_REF';
export const ICU_MESSAGE = 'ICU_MESSAGE';

export interface Token {
    type: string;
    value: any;
}

export class ParsedMesageTokenizer {
    private lexer: Tokenizr;

    private getLexer(): Tokenizr {
        const lexer = new Tokenizr();
        let plaintext = '';
        lexer.before((ctx, match, rule) => {
            if (rule.name !== TEXT && plaintext !== '') {
                ctx.accept(TEXT, plaintext);
                plaintext = '';
            }
        });
        lexer.finish((ctx) => {
            if (plaintext !== '') {
                ctx.accept(TEXT, plaintext)
            }
         });
        // start tag
        lexer.rule(/<([a-zA-Z][a-zA-Z]*)>/, (ctx, match) => {
            ctx.accept(START_TAG, match[1]);
        }, START_TAG);
        // end tag
        lexer.rule(/<\/([a-zA-Z][a-zA-Z]*)>/, (ctx, match) => {
            ctx.accept(END_TAG, match[1]);
        }, END_TAG);
        // placeholder
        lexer.rule(/{{([0-9]+)}}/, (ctx, match) => {
            ctx.accept(PLACEHOLDER, parseInt(match[1], 10));
        }, PLACEHOLDER);
        // icu message ref
        lexer.rule(/<ICU-Message-Ref_([0-9]+)\/>/, (ctx, match) => {
            ctx.accept(ICU_MESSAGE_REF, parseInt(match[1], 10));
        }, ICU_MESSAGE_REF);
        // icu message
        lexer.rule(/<ICU-Message\/>/, (ctx, match) => {
            ctx.accept(ICU_MESSAGE, match[0]);
        }, ICU_MESSAGE);
        // text
        lexer.rule(/./, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT);
        lexer.rule(/[\t\r\n]+/, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT);
        return lexer;
    }

    tokenize(normalizedMessage: string): Token[] {
        const lexer: Tokenizr = this.getLexer();
        lexer.reset();
        lexer.input(normalizedMessage);
        return lexer.tokens();
    }

}