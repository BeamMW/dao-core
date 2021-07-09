import * as consts from "./../../consts/consts.js";

class GovernanceComponent extends HTMLElement {
    componentParams = {
      distibuted: 0,
      locked: 0,
      available: 0,
      distibutedStr: '0',
      lockedStr: '0',
      availableStr: '0'
    }
  
    constructor() {
      super();
    }

    getTemplate() {
      const TEMPLATE =
      `<div class="governance">
          <div class="container__header">BEAMX GOVERNANCE</div>
          <div class="governance__title">Total supply</div>
          <div class="governance__value total">1,000,000 BEAMX</div>
          <div class="governance__title">Locked</div>
          <div class="governance__value">${this.componentParams.lockedStr} BEAMX</div>
          <div class="governance__title">Available</div>
          <div class="governance__value">${this.componentParams.availableStr} BEAMX</div>
          <div class="governance__title">Distributed</div>
          <div class="governance__value">${this.componentParams.distibutedStr} BEAMX</div>
          <div class="governance__separator"></div>
          <div class="governance__pkey" id="governance-show-key">Show public key</div>
      </div>`;

      return TEMPLATE;
    }
  
    render() {
      this.innerHTML = this.getTemplate();

      $('#governance-show-key').click(() => {
        let event = new CustomEvent("global-event", {
          detail: {
            type: 'show-public-key'
          }
        });
        document.dispatchEvent(event);
      });
    };
  
    connectedCallback() {
      this.render();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      let value = '';
      switch(name) {
        case 'emission':
          this.componentParams.available = newValue;
          value = Big(newValue).div(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM);
          this.componentParams.availableStr = value.toFixed();
          this.render();
          break;
      }
    }
  
    
    static get observedAttributes() {
      return ['emission'];
    }
  }
  
  customElements.define('governance-component', GovernanceComponent);