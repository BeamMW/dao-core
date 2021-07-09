import Utils from "./../../libs/utils.js";

class PublicKeyPopupComponent extends HTMLElement {
    componentParams = {
      key: ''
    }

    constructor() {
      super();
    }

    getTemplate() {
        const TEMPLATE =
        `<div class="popup">
            <div class="popup__content popup-key">
                <div class="popup__content__title">Public key</div>
                <div class="popup__value popup-key">
                    <span class="popup-key-value">${this.componentParams.key}</span>
                    <img class="popup-key-icon" id="key-copy-icon" src="./icons/icon-copy.svg"/>
                </div>
                <div class="popup__content__controls popup-key-controls">
                    <button class="container__main__controls__cancel ui-button" id="public-key-cancel">
                        <span class="ui-button__inner-wrapper">
                            <div class="ui-button__icon">
                                <img src="./icons/icon-cancel.svg"/>
                            </div>
                            <span class="ui-button__text cancel-text">cancel</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>`;

      return TEMPLATE;
    }
  
    render() {
        if (this.componentParams.key.length > 0) {
            this.innerHTML = this.getTemplate();

            $('#public-key-cancel').click(() => {
                $('public-key-popup-component').hide();
            });

            $('.popup__content.popup-key').css('height', 'unset');

            $('#key-copy-icon').click(() => {
                var textArea = document.createElement("textarea");
                textArea.style.position = "fixed";
                textArea.value = this.componentParams.key;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    return document.execCommand("copy");
                } catch (ex) {
                    return false;
                } finally {
                    document.body.removeChild(textArea);
                }
            });

            Utils.loadStyles();
        }
    };
  
    connectedCallback() {
      this.render();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {    
        let value = '';
        switch(name) {
            case 'key':
                this.componentParams.key = newValue;
                $('public-key-popup-component').show();
                this.render();

                break;
        }
    }
  
    
    static get observedAttributes() {
      return ['key'];
    }
  }

  customElements.define('public-key-popup-component', PublicKeyPopupComponent);
