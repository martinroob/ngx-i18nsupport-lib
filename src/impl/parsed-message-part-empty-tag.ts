import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
/**
 * Created by martin on 14.06.2017.
 * A message part consisting of an empty tag like <br/>.
 */

export class ParsedMessagePartEmptyTag extends ParsedMessagePart {

    private _tagname: string;

    constructor(tagname: string) {
        super(ParsedMessagePartType.EMPTY_TAG);
        this._tagname = tagname;
    }

    public asDisplayString(format?: string) {
        return '<' + this._tagname + '/>';
    }

    public tagName(): string {
        return this._tagname;
    }

}