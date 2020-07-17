import Page from './Page';
import AppView from './AppView';

export default class PageSelect extends HTMLDivElement {
    srqlsBtn: HTMLButtonElement | null = null;
    chatBtn: HTMLButtonElement | null = null;
    buttons: HTMLButtonElement[] = [];
    pages: Page[] = [];
    parent?: AppView;

    constructor() {
        super();

        this.id = 'page-select';
    }
    
    initialise() {
        if (!this.parent) return;

        this.srqlsBtn = this.createPageSelect('fas fa-th-large', 'SRQLS', this.parent.srqlPage);
        
        this.chatBtn = this.createPageSelect('fas fa-comment-alt', 'Chat', this.parent.chatPage);
        this.chatBtn.click();
    }

    createPageSelect(icon: string, text: string, target: Page) {
        var button = document.createElement('button');

        button.addEventListener('click', () => {
            this.pages.forEach(page => page.active = false);
            this.buttons.forEach(button => button.removeAttribute('active'));

            target.active = true;
            button.setAttribute('active', '');
        });

        button.innerHTML = `<i class='${icon}'></i>${text}`;

        this.appendChild(button);

        this.buttons.push(button);
        this.pages.push(target);

        return button;
    }
}