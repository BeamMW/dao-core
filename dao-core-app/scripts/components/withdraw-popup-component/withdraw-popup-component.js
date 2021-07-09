import Utils from "./../../libs/utils.js";
import * as consts from "./../../consts/consts.js"; 

class WithdrawPopupComponent extends HTMLElement {
    componentParams = {
      loaded: 0,
      isAllocation: 0
    }

    constructor() {
      super();
    }

    getTemplate() {
        const TEMPLATE =
        `<div class="popup">
            <div class="popup__content withdraw-tmpl">
                <div class="popup__content__title">Withdraw</div>
                <div class="popup__value">
                    <div class="withdraw-area__input">
                        <input type="text" class="withdraw-area__input__elem" placeholder="0" id="withdraw-input"/>
                        <span class="withdraw-area__input__text">
                            ${this.componentParams.isAllocation > 0 ? 'BEAMX' : 'BEAM'}
                        </span>
                    </div>
                    <div class="withdraw-area__rate">100 USD</div>
                    <div class="withdraw-area__fee">
                        <div class="withdraw-area__fee__title">Fee</div>
                        <div class="withdraw-area__fee__value">
                            <div class="withdraw-area__fee__value__beam">0,011 BEAM</div>
                            <div class="withdraw-area__fee__value__rate">2 USD</div>
                        </div>
                    </div>
                </div>
                <div class="withdraw-area__controls">
                    <button class="container__main__controls__cancel ui-button" id="withdraw-cancel">
                        <span class="ui-button__inner-wrapper">
                            <div class="ui-button__icon">
                                <img src="./icons/icon-cancel.svg"/>
                            </div>
                            <span class="ui-button__text cancel-text">cancel</span>
                        </span>
                    </button>
                    <button class="withdraw-area__controls__withdraw ui-button" id="withdraw-confirm">
                        <span class="ui-button__inner-wrapper">
                            <div class="ui-button__icon">
                                <img src="./icons/icon-withdraw.svg"/>
                            </div>
                            <span class="ui-button__text confirm-text">withdraw</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>`;

      return TEMPLATE;
    }
  
    render() {
        if (this.componentParams.loaded > 0) {
            this.innerHTML = this.getTemplate();

            $('#withdraw-cancel').click(() => {
                $('withdraw-popup-component').hide();
            });

            $('#withdraw-confirm').click(() => {
                let event = new CustomEvent("global-event", {
                    detail: {
                      type: 'withdraw-process',
                      is_allocation: this.componentParams.isAllocation,
                      amount: (Big($('#withdraw-input').val()).times(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM)).toFixed()
                    }
                  });
                document.dispatchEvent(event);
                $('withdraw-popup-component').hide();
            })

            $('.popup__content.withdraw-tmpl').css('height', 'unset');
            $('withdraw-popup-component').show();

            $('#withdraw-input').keydown((event) => {
                const specialKeys = [
                    'Backspace', 'Tab', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
                    'Control', 'Delete', 'F5'
                  ];

                if (specialKeys.indexOf(event.key) !== -1) {
                    return;
                }

                const current = $('#withdraw-input').val();
                const next = current.concat(event.key);
            
                if (!Utils.handleString(next)) {
                    event.preventDefault();
                }
            })

            $('#withdraw-input').bind('paste', (event) => {
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
            case 'is_allocation':
                this.componentParams.isAllocation = newValue;
                this.render();
                break;
        }
    }
  
    
    static get observedAttributes() {
      return ['loaded', 'is_allocation'];
    }
  }

  customElements.define('withdraw-popup-component', WithdrawPopupComponent);
