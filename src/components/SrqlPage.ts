import Page from './Page';

export default class SrqlPage extends Page {
    constructor() {
        super();

        this.id = 'srql-page';

        this.createSrqlTile('test', 'zuccthebigone', 's');
    }

    createSrqlTile(name: string, owner: string, id: string) {

        let tile = document.createElement('div');
        tile.className = 'tile';

        let optionsBtn = document.createElement('button');
        optionsBtn.className = 'options';
        optionsBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';

        let image = document.createElement('div');
        image.className = 'image';
        image.textContent = name.substr(0, 2);

        let title = document.createElement('div');
        title.className = 'title';
        title.textContent = name;

        let ownerElem = document.createElement('div');
        ownerElem.className = 'owner';
        ownerElem.textContent = '@' + owner;

        tile.appendChild(optionsBtn);
        tile.appendChild(image);
        tile.appendChild(title);
        tile.appendChild(ownerElem);

        tile.addEventListener('click', () => {
            
        });

        this.appendChild(tile);
    }
}