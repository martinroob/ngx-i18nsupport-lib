import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
import {NORMALIZATION_FORMAT_NGXTRANSLATE} from '../api/constants';
/**
 * Created by martin on 05.05.2017.
 * A reference to an ICU message
 * icu references are numbered from 0 to n.
 */

export class ParsedMessagePartICUMessageRef extends ParsedMessagePart {

    private _index: number;

    constructor(index: number) {
        super(ParsedMessagePartType.ICU_MESSAGE_REF);
        this._index = index;
    }

    public asDisplayString(format?: string) {
        return '<ICU-Message-Ref_' + this._index + '/>';
    }

    public index(): number {
        return this._index;
    }
}