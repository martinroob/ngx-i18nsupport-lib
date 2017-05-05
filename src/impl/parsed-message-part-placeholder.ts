import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a placeholder.
 * Placeholders are numbered from 0 to n.
 */

export class ParsedMessagePartPlaceholder extends ParsedMessagePart {

    private index: number;

    constructor(index: number) {
        super(ParsedMessagePartType.PLACEHOLDER);
        this.index = index;
    }

    public asDisplayString() {
        return '{{' + this.index + '}}';
    }
}