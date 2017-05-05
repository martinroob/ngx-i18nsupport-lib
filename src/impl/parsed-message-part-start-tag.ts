import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of an opening tag like <b> or <strange>.
 */

export class ParsedMessagePartStartTag extends ParsedMessagePart {

    private tagname: string;

    constructor(tagname: string) {
        super(ParsedMessagePartType.START_TAG);
        this.tagname = tagname;
    }

    public asDisplayString() {
        return '<' + this.tagname + '>';
    }
}