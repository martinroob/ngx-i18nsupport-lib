import {INormalizedMessage} from './i-normalized-message';
/**
 * Created by martin on 02.06.2017.
 * Interfaces for handling of ICU Messages.
 */

/**
 * A message category, which is a part of an ICU message.
 * E.g. the ICU message {wolves, plural, =0 {no wolves} =1 {one wolf} =2 {two wolves} other {a wolf pack}}
 * has 4 category objects with the categories =0, =1, =2, other.
 */
export interface IMessageCategory {

    /**
     * Fix part.
     * For plural mesages the category is "=0" or "=1" or "few" or "other"...
     * For select messages it is the matching key.
     */
    getCategory(): string;

    /**
     * Translatable part.
     */
    getMessageNormalized(): INormalizedMessage;
}

/**
 * An ICU message.
 */
export interface IICUMessage {

    /**
     * Is it a plural message?
     */
    isPluralMessage(): boolean;

    /**
     * Is it a select message?
     */
    isSelectMessage(): boolean;

    /**
     * All the parts of the message.
     * E.g. the ICU message {wolves, plural, =0 {no wolves} =1 {one wolf} =2 {two wolves} other {a wolf pack}}
     * has 4 category objects with the categories =0, =1, =2, other.
     */
    getCategories(): IMessageCategory[];
}