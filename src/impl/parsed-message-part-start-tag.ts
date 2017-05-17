import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of an opening tag like <b> or <strange>.
 */

export class ParsedMessagePartStartTag extends ParsedMessagePart {

    private _tagname: string;

    constructor(tagname: string) {
        super(ParsedMessagePartType.START_TAG);
        this._tagname = tagname;
    }

    public asDisplayString(format?: string) {
        return '<' + this._tagname + '>';
    }

    public tagName(): string {
        return this._tagname;
    }
}