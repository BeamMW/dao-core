import Utils from "./../../libs/utils.js";

class ClaimRewardsPopupComponent extends HTMLElement {
    componentParams = {
      beamxValue: ''
    }

    constructor() {
      super();
    }

    getTemplate() {
        const TEMPLATE =
        `<div class="popup">
            <div class="popup__content claim-rewards">
                <div class="popup__content__title">Claim rewards</div>
                <div class="popup__value claim-rewards">
                    <span class="claim-rewards-value">
                        You have farmed 
                        <span class="bold">${this.componentParams.beamxValue} BEAMX</span>
                        available for claim 
                    </span>
                </div>
                <div class="popup__content__controls claim-controls">
                    <button class="container__main__controls__cancel ui-button" id="claim-cancel">
                        <span class="ui-button__inner-wrapper">
                            <div class="ui-button__icon">
                                <img src="./icons/icon-cancel.svg"/>
                            </div>
                            <span class="ui-button__text cancel-text">cancel</span>
                        </span>
                    </button>
                    <button class="container__main__controls__confirm ui-button" id="claim-confirm">
                        <span class="ui-button__inner-wrapper">
                            <div class="ui-button__icon">
                                <img src="./icons/icon-star-blue.svg"/>
                            </div>
                            <span class="ui-button__text confirm-text">confirm</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>`;

      return TEMPLATE;
    }
  
    render() {
        if (this.componentParams.beamxValue > 0) {
            this.innerHTML = this.getTemplate();

            $('#claim-cancel').click(() => {
                $('claim-rewards-popup-component').hide();
            });

            $('#claim-confirm').click(() => {
                let event = new CustomEvent("global-event", {
                    detail: {
                      type: 'claim-rewards-process'
                      //todo send amount
                    }
                  });
                document.dispatchEvent(event);
                $('claim-rewards-popup-component').hide();
            })

            $('.popup__content.popup-key').css('height', 'unset');

            Utils.loadStyles();
        }
    };
  
    connectedCallback() {
      this.render();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {    
        let value = '';
        switch(name) {
            case 'value':
                this.componentParams.beamxValue = newValue;
                $('claim-rewards-popup-component').show();
                this.render();

                break;
        }
    }
  
    
    static get observedAttributes() {
      return ['value'];
    }
  }

  customElements.define('claim-rewards-popup-component', ClaimRewardsPopupComponent);
