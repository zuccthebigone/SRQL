export default class ChatFeed extends HTMLDivElement {
    constructor() {
        super();

        this.id = 'chat-feed';
    }

    loadFeed(feedId: string) {
        
    }

    createMessageElem(author: string) {
        let messageElem = document.createElement('span');
        messageElem.className = 'message';

        let authorElem = document.createElement('div');
        authorElem.className = 'author';
        authorElem.textContent = '@' + author;
        messageElem.appendChild(authorElem);

        this.appendChild(messageElem);

        return messageElem;
    }

    addMessage(message: string, author: string, own: boolean = false) {
        let messageElem = this.createMessageElem(author);
        if (own) messageElem.setAttribute('own', '');

        let textElem = document.createElement('div');
        textElem.className = 'text';
        textElem.textContent = message;
        messageElem.appendChild(textElem);
    }

    addFile(directory: string, author: string, own: boolean = false) {
        let fileElem = document.createElement('div');
        fileElem.className = 'file';
        if (own) fileElem.setAttribute('own', '');
        
        let fileNameElem = document.createElement('div');
        fileNameElem.className = 'name';
        fileNameElem.textContent = directory;
        fileElem.appendChild(fileNameElem);

        let authorElem = document.createElement('div');
        authorElem.className = 'author';
        authorElem.textContent = '@' + author;
        fileElem.appendChild(authorElem);

        let fileIconElem = document.createElement('i');
        fileIconElem.className = 'icon';

        let fileType = directory.split(/\.([^.\n]+)$/)[1];
        let fileIcon: string;

        console.log(fileType);

        switch (fileType) {
            case 'txt':
                fileIcon = 'fas fa-file-alt';
                break;
        
            default:
                fileIcon = 'fas fa-file';
                break;
        }

        fileIconElem.className += ' ' + fileIcon;

        fileElem.appendChild(fileIconElem);

        this.appendChild(fileElem);
    }
}