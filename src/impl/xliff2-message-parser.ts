import {AbstractMessageParser} from './abstract-message-parser';
import {ParsedMessage} from './parsed-message';
import {FORMAT_XLIFF20} from '../api/constants';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 2.0
 */
export class Xliff2MessageParser extends AbstractMessageParser {

    /**
     * Format of the translation file.
     * xmb xliff xliff2
     * Returns one of the constants FORMAT_..
     */
    public i18nFormat(): string {
        return FORMAT_XLIFF20;
    }

    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    protected processStartElement(elementNode: Element, message: ParsedMessage): boolean {
        const tagName = elementNode.tagName;
        if (tagName === 'ph') {
            // placeholder are like <ph id="0" equiv="INTERPOLATION" disp="{{number()}}"/>
            // They contain the id and also a name (number in the example)
            // TODO make some use of the name (but it is not available in XLIFF 1.2)
            let equiv = elementNode.getAttribute('equiv');
            let indexString = '';
            if (!equiv || !equiv.startsWith('INTERPOLATION')) {
                indexString = elementNode.getAttribute('id')
            } else {
                if (equiv === 'INTERPOLATION') {
                    indexString = '0';
                } else {
                    indexString = equiv.substring('INTERPOLATION_'.length);
                }
            }
            let index = Number.parseInt(indexString);
            message.addPlaceholder(index);
        } else if (tagName === 'pc') {
            // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
            let embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addOpenTag(embeddedTagName);
            }
        }
        return true;
    }

    /**
     * Handle end of this element node.
     * This is called after all children are processed.
     * @param elementNode
     * @param message message to be altered
     */
    protected processEndElement(elementNode: Element, message: ParsedMessage) {
        const tagName = elementNode.tagName;
        if (tagName === 'pc') {
            // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
            let embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addCloseTag(embeddedTagName);
            }
            return;
        }
    }

    private tagNameFromPCElement(pcNode: Element): string {
        let dispStart = pcNode.getAttribute('dispStart');
        if (dispStart.startsWith('<')) {
            dispStart = dispStart.substring(1);
        }
        if (dispStart.endsWith('>')) {
            dispStart = dispStart.substring(0, dispStart.length - 1);
        }
        return dispStart;
    }

}
