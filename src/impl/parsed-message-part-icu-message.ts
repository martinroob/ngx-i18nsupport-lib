import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
import {NORMALIZATION_FORMAT_NGXTRANSLATE} from '../api/constants';
import {IICUMessage} from '../api/i-icu-message';
import {
    COMMA, CURLY_BRACE_CLOSE, CURLY_BRACE_OPEN, ICUMessageTokenizer, ICUToken, PLURAL, SELECT,
    TEXT
} from './icu-message-tokenizer';
import {ICUMessage} from './icu-message';
import {format} from 'util';
import {INormalizedMessage} from '../api/i-normalized-message';
import {IMessageParser} from './i-message-parser';

/**
 * Created by martin on 02.06.2017.
 * A message part consisting of an icu message.
 * There can only be one icu message in a parsed message.
 * Syntax of ICU message is '{' <keyname> ',' 'select'|'plural' ',' (<category> '{' text '}')+ '}'
 */

export class ParsedMessagePartICUMessage extends ParsedMessagePart {

    private _message: ICUMessage;
    private _messageText: string;
    private _tokenizer: ICUMessageTokenizer;

    constructor(icuMessageText: string, private _parser: IMessageParser) {
        super(ParsedMessagePartType.ICU_MESSAGE);
        this.parse(icuMessageText);
        // TODO parse icu message text here
    }

    public asDisplayString(format?: string) {
        return '<ICU-Message/>';
    }

    public getICUMessage(): IICUMessage {
        return this._message;
    }

    private parse(text: string) {
        // TODO
        console.log('Tokenize', text);
        const tokens1 = new ICUMessageTokenizer().tokenize(text);
        tokens1.forEach((token) => {
            console.log('Token ', token.type, token.value);
        });
        this._messageText = text;
        this._tokenizer = new ICUMessageTokenizer();
        this._tokenizer.input(text);
        this.expectNext(CURLY_BRACE_OPEN);
        const varname = this.expectNext(TEXT).value;
        this.expectNext(COMMA);
        let token: ICUToken = this._tokenizer.next();
        if (token.type === PLURAL) {
            this._message = new ICUMessage(true);
        } else if (token.type === SELECT) {
            this._message = new ICUMessage(false);
        }
        this.expectNext(COMMA);
        token = this._tokenizer.peek();
        while (token.type !== CURLY_BRACE_CLOSE) {
            let category = this.expectNext(TEXT).value;
            this.expectNext(CURLY_BRACE_OPEN);
            let message = this.expectNext(TEXT).value;
            this._message.addCategory(category, this.parseMessage(message));
            this.expectNext(CURLY_BRACE_CLOSE);
            token = this._tokenizer.peek();
        }
        this.expectNext(CURLY_BRACE_CLOSE);
        // TODO expect EOF
    }

    private expectNext(tokentype: string): ICUToken {
        const token = this._tokenizer.next();
        if (token.type !== tokentype) {
            throw new Error(format('Error parsing ICU Message: expected %s, found %s (%s) (message %s)',
                tokentype, token.type, token.value, this._messageText));
        }
        return token;
    }

    private parseMessage(message: string): INormalizedMessage {
        return this._parser.parseNormalizedString(message, null);
    }
}