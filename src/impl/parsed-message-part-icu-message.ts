import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
import {NORMALIZATION_FORMAT_NGXTRANSLATE} from '../api/constants';
import {IICUMessage} from '../api/i-icu-message';
/**
 * Created by martin on 02.06.2017.
 * A message part consisting of an icu message.
 * There can only be one icu message in a parsed message.
 */

export class ParsedMessagePartICUMessage extends ParsedMessagePart {

    constructor(icuMessageText: string) {
        super(ParsedMessagePartType.ICU_MESSAGE);
        // TODO parse icu message text here
    }

    public asDisplayString(format?: string) {
        return '<ICU-Message/>';
    }

    public getICUMessage(): IICUMessage {
        return null; // TODO
    }
}