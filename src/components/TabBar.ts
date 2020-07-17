import { ipcRenderer } from 'electron';

export default class TabBar extends HTMLDivElement {
    settingsBtn: HTMLButtonElement;
    srqlSearch: HTMLInputElement;
    minBtn: HTMLButtonElement;
    restoreBtn: HTMLButtonElement;
    closeBtn: HTMLButtonElement;

    constructor() {
        super();

        this.id = 'tab-bar';


        this.settingsBtn = document.createElement('button');
        this.settingsBtn.className = 'settings';
        this.settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
        this.settingsBtn.addEventListener('click', event => {

        });


        this.srqlSearch = document.createElement('input');
        this.srqlSearch.type = 'text';
        this.srqlSearch.className = 'srql-search';
        this.srqlSearch.placeholder = 'Search or Type Command';

        this.srqlSearch.addEventListener('focus', () => {
            this.srqlSearch.placeholder = 'Type / or @ for commands'
        });

        this.srqlSearch.addEventListener('blur', () => {
            this.srqlSearch.placeholder = 'Search or Type Command'
        });


        this.minBtn = document.createElement('button');
        this.minBtn.innerHTML = '<i class="fas fa-minus"></i>';
        this.minBtn.addEventListener('click', () => ipcRenderer.invoke('minimise'));

        this.restoreBtn = document.createElement('button');
        this.restoreBtn.innerHTML = '<i class="far fa-window-maximize"></i>';
        this.restoreBtn.addEventListener('click', () => ipcRenderer.invoke('restore'));

        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'close';
        this.closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        this.closeBtn.addEventListener('click', () => ipcRenderer.invoke('close'));

        this.appendChild(this.settingsBtn);
        this.appendChild(this.srqlSearch);
        this.appendChild(this.closeBtn);
        this.appendChild(this.restoreBtn);
        this.appendChild(this.minBtn);

        window.addEventListener('resize', event => {
            ipcRenderer.invoke('isMaximised').then(isMaximised => {
                this.restoreBtn.innerHTML = isMaximised ? '<i class="far fa-window-restore"></i>' : '<i class="far fa-window-maximize"></i>';
            });
        });
    }
}