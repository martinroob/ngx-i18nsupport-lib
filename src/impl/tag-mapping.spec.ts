import {TagMapping} from './tag-mapping';
/**
 * Created by roobm on 02.06.2017.
 * Testcases for Mapping from normalized tag names to placeholder names.
 */

describe('tag mapping spec', () => {

    it('should map START_EMPHASISED_TEXT to em', () => {
        const placeholderName = 'START_EMPHASISED_TEXT';
        const tagname = new TagMapping().getTagnameFromStartTagPlaceholderName(placeholderName);
        expect(tagname).toBe('em');
    });

    it('should map START_BOLD_TEXT to b', () => {
        const placeholderName = 'START_BOLD_TEXT';
        const tagname = new TagMapping().getTagnameFromStartTagPlaceholderName(placeholderName);
        expect(tagname).toBe('b');
    });

    it('should map START_TAG_IMG to img', () => {
        const placeholderName = 'START_TAG_IMG';
        const tagname = new TagMapping().getTagnameFromStartTagPlaceholderName(placeholderName);
        expect(tagname).toBe('img');
    });

    it('should map START_LINK to a', () => {
        const placeholderName = 'START_LINK';
        const tagname = new TagMapping().getTagnameFromStartTagPlaceholderName(placeholderName);
        expect(tagname).toBe('a');
    });

    it('should map START_LINK_1 to a', () => {
        const placeholderName = 'START_LINK_1';
        const tagname = new TagMapping().getTagnameFromStartTagPlaceholderName(placeholderName);
        expect(tagname).toBe('a');
    });

    it('should map START_LINK_100 to a', () => {
        const placeholderName = 'START_LINK_100';
        const tagname = new TagMapping().getTagnameFromStartTagPlaceholderName(placeholderName);
        expect(tagname).toBe('a');
    });

    it('should map CLOSE_TAG_IMG to img', () => {
        const placeholderName = 'CLOSE_TAG_IMG';
        const tagname = new TagMapping().getTagnameFromCloseTagPlaceholderName(placeholderName);
        expect(tagname).toBe('img');
    });

    it('should map CLOSE_LINK to a', () => {
        const placeholderName = 'CLOSE_LINK';
        const tagname = new TagMapping().getTagnameFromCloseTagPlaceholderName(placeholderName);
        expect(tagname).toBe('a');
    });

    it('should map CLOSE_LINK_1 to a', () => {
        const placeholderName = 'CLOSE_LINK_1';
        const tagname = new TagMapping().getTagnameFromCloseTagPlaceholderName(placeholderName);
        expect(tagname).toBe('a');
    });

    it('should map tag a to START_LINK', () => {
        const tagname = 'a';
        const placeholderName = new TagMapping().getStartTagPlaceholderName(tagname);
        expect(placeholderName).toBe('START_LINK');
    });

    it('should map end tag img to CLOSE_TAG_IMG', () => {
        const tagname = 'img';
        const placeholderName = new TagMapping().getCloseTagPlaceholderName(tagname);
        expect(placeholderName).toBe('CLOSE_TAG_IMG');
    });

    it('should map end tag strange to CLOSE_TAG_STRANGE', () => {
        const tagname = 'strange';
        const placeholderName = new TagMapping().getCloseTagPlaceholderName(tagname);
        expect(placeholderName).toBe('CLOSE_TAG_STRANGE');
    });

    it('should map end tag b to CLOSE_BOLD_TEXT', () => {
        const tagname = 'b';
        const placeholderName = new TagMapping().getCloseTagPlaceholderName(tagname);
        expect(placeholderName).toBe('CLOSE_BOLD_TEXT');
    });


});