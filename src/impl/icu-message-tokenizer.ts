import * as Tokenizr from 'tokenizr';

/**
 * Created by martin on 04.06.2017.
 * A tokenizer for ICU messages.
 */

// Tokens
export const TEXT = 'TEXT';
export const CURLY_BRACE_OPEN = 'CURLY_BRACE_OPEN';
export const CURLY_BRACE_CLOSE = 'CURLY_BRACE_CLOSE';
export const COMMA = 'COMMA';
export const PLURAL = 'PLURAL';
export const SELECT = 'SELECT';

export interface ICUToken {
    type: string;
    value: any;
}

export class ICUMessageTokenizer {
    private lexer: Tokenizr;

    private getLexer(): Tokenizr {
        const lexer = new Tokenizr();
        let plaintext = '';
        lexer.before((ctx, match, rule) => {
            if (rule.name !== TEXT) {
                if (this.containsNonWhiteSpace(plaintext)) {
                    ctx.accept(TEXT, plaintext);
                    plaintext = '';
                } else {
                    ctx.ignore();
                }
            }
        });
        lexer.finish((ctx) => {
            if (this.containsNonWhiteSpace(plaintext)) {
                ctx.accept(TEXT, plaintext)
            }
         });
        // curly brace
        lexer.rule(/{/, (ctx, match) => {
            ctx.accept(CURLY_BRACE_OPEN, match[0]);
        }, CURLY_BRACE_OPEN);
        lexer.rule(/}/, (ctx, match) => {
            ctx.accept(CURLY_BRACE_CLOSE, match[0]);
        }, CURLY_BRACE_CLOSE);
        // comma
        lexer.rule(/,/, (ctx, match) => {
            ctx.accept(COMMA, match[0]);
        }, COMMA);
        // keywords plural and select
        lexer.rule(/plural/, (ctx, match) => {
            ctx.accept(PLURAL, match[0]);
        }, PLURAL);
        lexer.rule(/select/, (ctx, match) => {
            ctx.accept(SELECT, match[0]);
        }, SELECT);
        // text
        lexer.rule(/./, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT);
        lexer.rule(/[\s]+/, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT);
        return lexer;
    }

    private containsNonWhiteSpace(text: string): boolean {
        for (let i = 0; i < text.length; i++) {
            if (!/\s/.test(text.charAt(i))) {
                return true;
            }
        }
        return false;
    }

    tokenize(normalizedMessage: string): ICUToken[] {
        const lexer: Tokenizr = this.getLexer();
        lexer.reset();
        lexer.input(normalizedMessage);
        return lexer.tokens();
    }

    input(normalizedMessage: string) {
        this.lexer = this.getLexer();
        this.lexer.reset();
        this.lexer.input(normalizedMessage);
    }

    next(): ICUToken {
        return this.lexer.token();
    }

    peek(): ICUToken {
        return this.lexer.peek();
    }
}