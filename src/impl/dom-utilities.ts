import {DOMParser, XMLSerializer} from 'xmldom';
/**
 * Created by martin on 01.05.2017.
 * Some Tool functions for XML Handling.
 */

export class DOMUtilities {

    /**
     * return the first subelement with the given tag.
     * @param element
     * @param tagName
     * @return {Element} subelement or null, if not existing.
     */
    public static getFirstElementByTagName(element: Element | Document, tagName: string): Element {
        let matchingElements = element.getElementsByTagName(tagName);
        if (matchingElements && matchingElements.length > 0) {
            return matchingElements.item(0);
        } else {
            return null;
        }
    }

    /**
     * return content of element as string, including all markup.
     * @param element
     * @return {string}
     */
    public static getXMLContent(element: Element): string {
        if (!element) {
            return null;
        }
        let result = new XMLSerializer().serializeToString(element);
        let tagName = element.nodeName;
        let reStartMsg: RegExp = new RegExp('<' + tagName + '[^>]*>', 'g');
        result = result.replace(reStartMsg, '');
        let reEndMsg: RegExp = new RegExp('</' + tagName + '>', 'g');
        result = result.replace(reEndMsg, '');
        return result;
    }

    /**
     * return PCDATA content of element.
     * @param element
     * @return {string}
     */
    public static getPCDATA(element: Element): string {
        if (!element) {
            return null;
        }
        let result = '';
        let childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let child = childNodes.item(i);
            if (child.nodeType === child.TEXT_NODE || child.nodeType === child.CDATA_SECTION_NODE) {
                result = result + child.nodeValue;
            }
        }
        return result.length === 0 ? null : result;
    }

    /**
     * replace PCDATA content with a new one.
     * @param element
     * @param pcdata
     */
    public static replaceContentWithXMLContent(element: Element, pcdata: string) {
        // remove all children
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        // parseICUMessage pcdata
        let pcdataFragment: Document = new DOMParser().parseFromString('<fragment>' + pcdata + '</fragment>', 'application/xml');
        let newChildren = pcdataFragment.getElementsByTagName('fragment').item(0).childNodes;
        for (let j = 0; j < newChildren.length; j++) {
            let newChild = newChildren.item(j);
            element.appendChild(element.ownerDocument.importNode(newChild, true));
        }
    }

    /**
     * find the previous sibling that is an element.
     * @param {Node} element
     * @return {Element}
     */
    public static getPreviousElementSibling(element: Node): Element {
        let node = element.previousSibling;
        while (node !== null) {
            if (node.nodeType === node.ELEMENT_NODE) {
                return <Element> node;
            }
            node = node.previousSibling;
        }
        return null;
    }

    /**
     * Create an Element Node that is the next sibling of a given node.
     * @param elementNameToCreate
     * @param {Node} previousSibling
     * @return {Element}
     */
    public static createFollowingSibling(elementNameToCreate: string, previousSibling: Node): Element {
        const newElement = previousSibling.ownerDocument.createElement('target');
        if (previousSibling.nextSibling !== null) {
            previousSibling.parentNode.insertBefore(newElement, previousSibling.nextSibling);
        } else {
            previousSibling.parentNode.appendChild(newElement);
        }
        return newElement;
    }
}