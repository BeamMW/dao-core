import Utils from "./../../libs/utils.js";
import * as consts from "./../../consts/consts.js"; 

class DepositPopupComponent extends HTMLElement {
    componentParams = {
      loaded: 0
    }

    constructor() {
      super();
    }

    getTemplate() {
        const TEMPLATE =
        `<div class="popup">
            <div class="popup__content deposit-tmpl">
                <div class="deposit-area">
                    <div class="area-header">Deposit</div>
                    <div class="deposit-area__input">
                        <input type="text" class="deposit-area__input__elem" placeholder="0" id="deposit-input"/>
                        <span class="deposit-area__input__text">BEAM</span>
                    </div>
                    <div class="deposit-area__rate">100 USD</div>
                    <div class="deposit-area__fee">
                        <div class="deposit-area__fee__title">Fee</div>
                        <div class="deposit-area__fee__value">
                            <div class="deposit-area__fee__value__beam">0,011 BEAM</div>
                            <div class="deposit-area__fee__value__rate">2 USD</div>
                        </div>
                    </div>
                    <div class="deposit-area__controls">
                        <button class="container__main__controls__cancel ui-button" id="deposit-cancel">
                            <span class="ui-button__inner-wrapper">
                                <div class="ui-button__icon">
                                    <img src="./icons/icon-cancel.svg"/>
                                </div>
                                <span class="ui-button__text cancel-text">cancel</span>
                            </span>
                        </button>
                        <button class="deposit-area__controls__deposit ui-button" id="deposit-confirm">
                            <span class="ui-button__inner-wrapper">
                                <div class="ui-button__icon">
                                    <img src="./icons/icon-deposit-blue.svg"/>
                                </div>
                                <span class="ui-button__text confirm-text">deposit</span>
                            </span>
                        </button>
                    </div>
                </div>    
                <div class="calc-area">
                    <div class="area-header">Staking calculator</div>
                </div>
            </div>
        </div>`;

      return TEMPLATE;
    }
  
    render() {
        if (this.componentParams.loaded > 0) {
            this.innerHTML = this.getTemplate();

            $('#deposit-cancel').click(() => {
                $('deposit-popup-component').hide();
            });

            $('#deposit-confirm').click(() => {
                let event = new CustomEvent("global-event", {
                    detail: {
                      type: 'deposit-process',
                      amount: (Big($('#deposit-input').val()).times(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM)).toFixed()
                    }
                  });
                document.dispatchEvent(event);
                $('deposit-popup-component').hide();
            })

            $('.popup__content.deposit-tmpl').css('height', 'unset');
            $('deposit-popup-component').show();

            $('#deposit-input').keydown((event) => {
                const specialKeys = [
                    'Backspace', 'Tab', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
                    'Control', 'Delete', 'F5'
                  ];

                if (specialKeys.indexOf(event.key) !== -1) {
                    return;
                }

                const current = $('#deposit-input').val();
                const next = current.concat(event.key);
            
                if (!Utils.handleString(next)) {
                    event.preventDefault();
                }
            })

            $('#deposit-input').bind('paste', (event) => {
                const text = event.clipboardData.getData('text');
                if (!Utils.handleString(text)) {
                    event.preventDefault();
                }
            })

            Utils.loadStyles();
        }
    };
  
    connectedCallback() {
      this.render();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {    
        switch(name) {
            case 'loaded':
                this.componentParams.loaded = newValue;
                this.render();

                break;
        }
    }
  
    
    static get observedAttributes() {
      return ['loaded'];
    }
  }

  customElements.define('deposit-popup-component', DepositPopupComponent);
