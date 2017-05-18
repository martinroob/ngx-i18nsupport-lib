import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
import {NORMALIZATION_FORMAT_NGXTRANSLATE} from '../api/constants';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a placeholder.
 * Placeholders are numbered from 0 to n.
 */

export class ParsedMessagePartPlaceholder extends ParsedMessagePart {

    private _index: number;

    constructor(index: number) {
        super(ParsedMessagePartType.PLACEHOLDER);
        this._index = index;
    }

    public asDisplayString(format?: string) {
        if (format === NORMALIZATION_FORMAT_NGXTRANSLATE) {
            return '{{' + this._index + '}}';
        }
        return '{{' + this._index + '}}';
    }
    public index(): number {
        return this._index;
    }
}