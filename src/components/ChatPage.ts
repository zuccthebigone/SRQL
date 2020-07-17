import Page from './Page';
import ChatFeed from './ChatFeed';
import FeedInput from './FeedInput';

customElements.define('chat-feed', ChatFeed, { extends: 'div' });
customElements.define('feed-input', FeedInput, { extends: 'input' });

export default class ChatPage extends Page {
    feed: ChatFeed;
    input: FeedInput;
    infoElem: HTMLDivElement;
    titleElem: HTMLDivElement;
    ownerElem: HTMLDivElement;

    constructor() {
        super();

        this.id = 'chat-page';

        this.infoElem = document.createElement('div');
        this.infoElem.className = 'info';
        this.appendChild(this.infoElem);

        this.titleElem = document.createElement('div');
        this.titleElem.className = 'title';
        this.infoElem.appendChild(this.titleElem);

        this.ownerElem = document.createElement('div');
        this.ownerElem.className = 'owner';
        this.infoElem.appendChild(this.ownerElem);

        this.feed = <ChatFeed>document.createElement('div', { is: 'chat-feed' });
        this.appendChild(this.feed);

        this.input = <FeedInput>document.createElement('input', { is: 'feed-input' });
        this.appendChild(this.input);
        this.input.feed = this.feed;

        this.loadFeed('');
    }

    loadFeed(feedId: string) {
        this.titleElem.textContent = 'test';
        this.ownerElem.textContent = 'zuccthebigone';
    }
}