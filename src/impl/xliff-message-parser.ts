import {AbstractMessageParser} from './abstract-message-parser';
import {ParsedMessage} from './parsed-message';
import {FORMAT_XLIFF12} from '../api/constants';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 1.2
 */
export class XliffMessageParser extends AbstractMessageParser {

    /**
     * Format of the translation file.
     * xmb xliff xliff2
     * Returns one of the constants FORMAT_..
     */
    public i18nFormat(): string {
        return FORMAT_XLIFF12;
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
        if (tagName === 'x') {
            // placeholder are like <x id="INTERPOLATION"/> or <x id="INTERPOLATION_1">
            let id = elementNode.getAttribute('id');
            if (!id) {
                return; // should not happen
            }
            if (id.startsWith('INTERPOLATION')) {
                const index = this.parsePlaceholderIndexFromId(id);
                message.addPlaceholder(index);
            } else if (id === 'START_BOLD_TEXT') {
                message.addOpenTag('b');
            } else if (id === 'CLOSE_BOLD_TEXT') {
                message.addCloseTag('b');
            } else if (id.startsWith('START_TAG_')) {
                message.addOpenTag(id.substring('START_TAG_'.length));
            } else if (id.startsWith('CLOSE_TAG_')) {
                message.addCloseTag(id.substring('CLOSE_TAG_'.length));
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
    }

    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param id
     * @return {number}
     */
    private parsePlaceholderIndexFromId(id: string): number {
        let indexString = '';

        if (id === 'INTERPOLATION') {
            indexString = '0';
        } else {
            indexString = id.substring('INTERPOLATION_'.length);
        }
        return Number.parseInt(indexString);
    }

}
