import {DOMParser, XMLSerializer} from "xmldom";
import {ITranslationMessagesFile} from '../api/i-translation-messages-file';
import {isNullOrUndefined, format} from 'util';
import {ITransUnit} from '../api/i-trans-unit';
import {DOMUtilities} from './dom-utilities';
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XMB file.
 */

export class XmbTransUnit implements ITransUnit {

    constructor(private _msg: Element, private _id: string, private _sourceTransUnitFromMaster: ITransUnit) {

    }

    public get id(): string {
        return this._id;
    }

    /**
     * Get content to translate.
     * Source parts are excluded here.
     * @return {string}
     */
    public sourceContent(): string {
        let msgContent = DOMUtilities.getPCDATA(this._msg);
        let reSourceElem: RegExp = /<source>.*<\/source>/g;
        msgContent = msgContent.replace(reSourceElem, '');
        return msgContent;
    }

    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    public targetContent(): string {
        // in fact, target and source are just the same in xmb
        return this.sourceContent();
    }

    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized(): string {
        let directHtml = this.targetContent();
        if (!directHtml) {
            return directHtml;
        }
        let normalized = directHtml;
        let re0: RegExp = /<ph name="INTERPOLATION"><ex>INTERPOLATION<\/ex><\/ph>/g;
        normalized = normalized.replace(re0, '{{0}}');
        let reN: RegExp = /<ph name="INTERPOLATION_1"><ex>INTERPOLATION_(\d*)<\/ex><\/ph>/g;
        normalized = normalized.replace(reN, '{{$1}}');

        let reStartAnyTag: RegExp = /<ph name="START_\w*"><ex>&amp;lt;(\w*)&amp;gt;<\/ex><\/ph>/g;
        normalized = normalized.replace(reStartAnyTag, '<$1>');
        let reStartAnyTag2: RegExp = /<ph name="START_\w*"><ex>&lt;(\w*)><\/ex><\/ph>/g;
        normalized = normalized.replace(reStartAnyTag2, '<$1>');
        let reCloseAnyTag: RegExp = /<ph name="CLOSE_\w*"><ex>&amp;lt;\/(\w*)&amp;gt;<\/ex><\/ph>/g;
        normalized = normalized.replace(reCloseAnyTag, '</$1>');
        let reCloseAnyTag2: RegExp = /<ph name="CLOSE_\w*"><ex>&lt;\/(\w*)><\/ex><\/ph>/g;
        normalized = normalized.replace(reCloseAnyTag2, '</$1>');

        return normalized;
    }

    /**
     * State of the translation.
     * (not supported in xmb)
     * If we have a master, we assumed it is translated if the content is not the same as the masters one.
     */
    public targetState(): string {
        if (this._sourceTransUnitFromMaster) {
            let sourceContent = this._sourceTransUnitFromMaster.sourceContent();
            if (!sourceContent || sourceContent === this.targetContent()) {
                return 'new';
            } else {
                return 'final';
            }
        }
        return null; // not supported in xmb
    }

    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    public sourceReferences(): { sourcefile: string, linenumber }[] {
        let sourceElements = this._msg.getElementsByTagName('source');
        let sourceRefs: { sourcefile: string, linenumber }[] = [];
        for (let i = 0; i < sourceElements.length; i++) {
            let elem = sourceElements.item(i);
            const sourceAndPos: string = DOMUtilities.getPCDATA(elem);
            sourceRefs.push(this.parseSourceAndPos(sourceAndPos));
        }
        return sourceRefs;
    }

    /**
     * Parses something like 'c:\xxx:7' and returns source and linenumber.
     * @param sourceAndPossomething like 'c:\xxx:7', last colon is the separator
     * @return {{sourcefile: string, linenumber: number}}
     */
    private parseSourceAndPos(sourceAndPos: string): { sourcefile: string, linenumber } {
        let index = sourceAndPos.lastIndexOf(':');
        if (index < 0) {
            return {
                sourcefile: sourceAndPos,
                linenumber: 0
            }
        } else {
            return {
                sourcefile: sourceAndPos.substring(0, index),
                linenumber: this.parseLineNumber(sourceAndPos.substring(index + 1))
            }
        }
    }

    private parseLineNumber(lineNumberString: string): number {
        return Number.parseInt(lineNumberString);
    }

    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xmb this is stored in the attribute "desc".
     */
    public description(): string {
        return this._msg.getAttribute('desc');
    }

    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xmb this is stored in the attribute "meaning".
     */
    public meaning(): string {
        return this._msg.getAttribute('meaning');
    }

    /**
     * the real xml element used for trans unit.
     * Here it is a <msg> element.
     * @return {Element}
     */
    public asXmlElement(): Element {
        return this._msg;
    }

    /**
     * Copy source to target to use it as dummy translation.
     * (better than missing value)
     * In xmb there is nothing to do, because there is only a target, no source.
     */
    public useSourceAsTarget(isDefaultLang: boolean, copyContent: boolean) {
    }

    /**
     * Translate trans unit.
     * (very simple, just for tests)
     * @param translation the translated string
     */
    public translate(translation: string) {
        let target = this._msg;
        // reconvert source refs to html part in translation message
        let sourceRefsHtml = this.sourceRefsToHtml();
        if (isNullOrUndefined(translation)) {
            translation = '';
        }
        DOMUtilities.replaceContentWithPCDATA(target, sourceRefsHtml + translation);
    }

    /**
     * convert the source refs to html.
     * Result is something like <source>c:\x:93</source>
     */
    private sourceRefsToHtml(): string {
        let result: string = '';
        this.sourceReferences().forEach((sourceRef) => {
            result = result + '<source>' + sourceRef.sourcefile + ':' + sourceRef.linenumber + '</source>';
        });
        return result;
    }
}
