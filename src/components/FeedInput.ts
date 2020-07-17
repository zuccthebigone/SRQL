import ChatFeed from './ChatFeed';
import User from '../services/User';

export default class FeedInput extends HTMLInputElement {

    feed?: ChatFeed;

    constructor() {
        super();

        this.id = 'feed-input';
        this.type = 'text';
        this.placeholder = 'Enter message...';
        this.addEventListener('keypress', event => {
            if (event.key === 'Enter') this.submitInput();
        });

        setTimeout(() => {
            for (let i = 0; i < 100; i ++) {
                this.value = '~~test_file.txt';
                this.submitInput();
            }
        }, 100);
    }

    submitInput() {
        let message = this.value;
        this.value = '';

        if (!this.feed) return;

        switch (message.substr(0, 2)) {
            case '~~':
                this.feed.addFile(message.substring(2), User.currentUser, true);
                break;
        
            default:
                this.feed.addMessage(message, User.currentUser, true);
                break;
        }
    }
}