import {ParsedMessagePart, ParsedMessagePartType} from './parsed-message-part';
/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a closing tag like </b> or </strange>.
 */

export class ParsedMessagePartEndTag extends ParsedMessagePart {

    private tagname: string;

    constructor(tagname: string) {
        super(ParsedMessagePartType.END_TAG);
        this.tagname = tagname;
    }

    public asDisplayString() {
        return '</' + this.tagname + '>';
    }
}