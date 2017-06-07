import {IICUMessage, IMessageCategory} from '../api/i-icu-message';
import {INormalizedMessage} from '../api/i-normalized-message';

class MessageCategory implements IMessageCategory {

    constructor(private _category: string, private _message: INormalizedMessage) {}

    public getCategory(): string {
        return this._category;
    }

    public getMessageNormalized(): INormalizedMessage {
        return this._message;
    }
}

/**
 * Implementation of an ICU Message.
 * Created by martin on 05.06.2017.
 */
export class ICUMessage implements IICUMessage {

    private _isPluralMessage: boolean;

    private _categories: IMessageCategory[];

    constructor(isPluralMessage: boolean) {
        this._isPluralMessage = isPluralMessage;
        this._categories = [];
    }

    addCategory(category: string, message: INormalizedMessage) {
        this._categories.push(new MessageCategory(category, message));
    }

    /**
     * Is it a plural message?
     */
    isPluralMessage(): boolean {
        return this._isPluralMessage;
    }

    /**
     * Is it a select message?
     */
    isSelectMessage(): boolean {
        return !this._isPluralMessage;
    }

    /**
     * All the parts of the message.
     * E.g. the ICU message {wolves, plural, =0 {no wolves} =1 {one wolf} =2 {two wolves} other {a wolf pack}}
     * has 4 category objects with the categories =0, =1, =2, other.
     */
    getCategories(): IMessageCategory[] {
        return this._categories;
    }

}