import {FORMAT_XMB, FILETYPE_XLIFF12, FILETYPE_XLIFF20} from '../api';
import {XmbMessageParser} from './xmb-message-parser';
import {XliffMessageParser} from './xliff-message-parser';
import {Xliff2MessageParser} from './xliff2-message-parser';
/**
 * Created by martin on 12.05.2017.
 */
export class MessageParserFactory {

    public static parserForFormat(i18nFormat: string) {
        switch (i18nFormat) {
            case FORMAT_XMB:
                return new XmbMessageParser();
            case FILETYPE_XLIFF12:
                return new XliffMessageParser();
            case FILETYPE_XLIFF20:
                return new Xliff2MessageParser();
        }
    }

}