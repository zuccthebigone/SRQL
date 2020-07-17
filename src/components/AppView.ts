import TabBar from './TabBar';
import PageSelect from './PageSelect';
import SrqlPage from './SrqlPage';
import ChatPage from './ChatPage';

customElements.define('tab-bar', TabBar, { extends: 'div' });
customElements.define('page-select', PageSelect, { extends: 'div' });
customElements.define('srql-page', SrqlPage, { extends: 'div' });
customElements.define('chat-page', ChatPage, { extends: 'div' });

export default class AppView extends HTMLDivElement {
    tabBar: TabBar;
    pageSelect: PageSelect;
    srqlPage: SrqlPage;
    chatPage: ChatPage;

    constructor() {
        super();
        this.id = 'app-view';

        this.tabBar = <TabBar>document.createElement('div', { is: 'tab-bar' });
        this.appendChild(this.tabBar);
        
        this.srqlPage = <SrqlPage>document.createElement('div', { is: 'srql-page' });
        this.appendChild(this.srqlPage);

        this.chatPage = <ChatPage>document.createElement('div', { is: 'chat-page' });
        this.appendChild(this.chatPage);

        this.pageSelect = <PageSelect>document.createElement('div', { is: 'page-select' });
        this.pageSelect.parent = this;
        this.pageSelect.initialise();
        this.appendChild(this.pageSelect);
    }
}

window.customElements.define('app-view', AppView, { extends: 'div' });

let app = document.createElement('div', { is: 'app-view' });
document.body.appendChild(app);