export default class Page extends HTMLDivElement {
    constructor() {
        super();
        this.classList.add('page');
    }

    get active() {
        return this.hasAttribute('active');
    }

    set active(val: boolean) {
        val ? this.setAttribute('active', '') : this.removeAttribute('active');
    }
}