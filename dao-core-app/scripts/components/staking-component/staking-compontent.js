import * as consts from "./../../consts/consts.js";
import Utils from "./../../libs/utils.js";

class StakingComponent extends HTMLElement {
  componentParams = {
    beam: 0,
    beamx: 0,
    beamxStr: '0',
    beamStr: '0',
    rate: 0,
    beamTotalLockedStr: '0',
    beamTotalLocked: 0,
    loaded: false
  }

  constructor() {
    super();
  }

  formateValue(value) {
    return parseFloat(value.toFixed(2)).toString();
  }

  getRateStr(value) {
    return this.componentParams.rate > 0 
      ? Utils.numberWithSpaces(this.formateValue(new Big(value).times(this.componentParams.rate))) + ' USD'
      : '';
  }

  getTemplate() {
    const FARMED = 
      `<div class="farmed-value">
          <img class="farmed-value__beamx-icon" src="./icons/icon-beamx.png"/>
          <span class="farmed-value__beamx-amount" id="beamx-value">
            ${Utils.numberWithSpaces(this.componentParams.beamxStr)} BEAMX
          </span>
      </div>
      <div class="farmed-claim" id="staking-claim-rewards">
          <img class="farmed-claim__icon" src="./icons/icon-star.svg">
          <span class="farmed-claim__text">claim rewards</span>
      </div>`;

    const FARMED_EMPTY =
      `<div class="farmed-empty-text">You have nothing farmed yet.</div>`;

    const TEMPLATE_EMPTY = 
      `<div class="staking-empty-container">
          <div class="container__header">STAKING</div>
          <div class="staking-empty">
              <div class="staking-empty__text">Deposit your BEAM and get BEAMX</div>
              <div>
                  <button class="staking-empty__deposit-button ui-button" id="empty-deposit">
                      <span class="ui-button__inner-wrapper">
                          <div class="ui-button__icon">
                              <img src="./icons/icon-send-blue.svg"/>
                          </div>
                          <span class="ui-button__text">deposit</span>
                      </span>
                  </button>
              </div>
          </div>
      </div>`;
    
    const TEMPLATE_LOADING = 
      `<div class="staking" id="staking-component"></div>`;

    const TEMPLATE = 
      `<div class="staking" id="staking-component">
          <div class="staking__header">
            <div class="container__header">STAKING</div>
            <div class="staking__header__info">
              <div class="info-tvl">
                <div class="info-title">Total value locked</div>
                <div class="info-tvl__value">
                  ${ Utils.numberWithSpaces(this.componentParams.beamTotalLockedStr) } BEAM
                </div>
                <div class="info-tvl__rate">${ this.getRateStr(this.componentParams.beamTotalLockedStr) }</div>
              </div>
              <div class="info-arp-y">
                <div class="info-title">Yearly reward</div>
                <div class="info-arp-y__value">10-14 BEAMX</div>
              </div>
              <div class="info-arp-w">
                <div class="info-arp-w__container">
                  <span class="info-title">Weekly reward</span>
                  <img class="info-arp-w__container__icon" src="./icons/icon-info.svg" />
                </div>
                <div class="info-arp-w__value">0.23-0.67 BEAMX</div>
              </div>
            </div>
          </div>
          <div class="staking-content">
              <div class="staking__deposit">
                  <div class="staking__deposit__total">
                      <div class="container-title">Balance</div>
                      <div class="total-container">
                          <img class="total-container__icon" src="./icons/icon-beam.svg">
                          <div class="total-container__value">
                              <div class="total-container__value__beam" id="beam-value">
                                ${ Utils.numberWithSpaces(this.componentParams.beamStr) } BEAM
                              </div>
                              <div class="total-container__value__usd">
                              ${ this.getRateStr(this.componentParams.beamStr) }
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="staking__deposit__controls">
                      <div class="deposit-control" id="deposit">
                          <img class="deposit__icon" src="./icons/icon-send.svg"/>
                          <span class="deposit__text">deposit</span>
                      </div>
                      <div class="withdraw-control" id="withdraw">
                          <img class="withdraw__icon" src="./icons/icon-receive.svg"/>
                          <span class="withdraw__text">withdraw</span>
                      </div>
                  </div>
              </div>
              <div class="staking__separator"></div>
              <div class="staking__farmed">
                  <div class="container-title">Farmed</div>
                  <div class="staking__farmed__container">
                      ${this.componentParams.beamx > 0 ? FARMED : FARMED_EMPTY}
                  </div>
              </div>
          </div>
      </div>`;

      return this.componentParams.loaded 
        ? (this.componentParams.beamx > 0 || this.componentParams.beam > 0 ? TEMPLATE : TEMPLATE_EMPTY)
        : TEMPLATE_LOADING;
  } 

  render() {
    this.innerHTML = this.getTemplate();

    $('#withdraw').click((ev) => {
      ev.stopPropagation();
      let event = new CustomEvent("global-event", {
        detail: {
          type: 'page',
          to: 'staking-page',
          activeSelector: 'WITHDRAW'
        }
      });
      document.dispatchEvent(event);
    });

    $('#staking-claim-rewards').click((ev) => {
      const component = $('claim-rewards-popup-component');
      component.attr('is_allocation', 0);
      component.attr('value_str', this.componentParams.beamxStr);
      component.attr('value', this.componentParams.beamx);
    });

    $('#empty-deposit, #deposit').click((ev) => {
      let event = new CustomEvent("global-event", {
        detail: {
          type: 'deposit-popup-open',
        }
      });
      document.dispatchEvent(event);
    })

    $('#withdraw').click((ev) => {
      let event = new CustomEvent("global-event", {
        detail: {
          type: 'withdraw-popup-open',
          is_allocation: false
        }
      });
      document.dispatchEvent(event);
    })
  };

  connectedCallback() {
    this.render();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    let value = Big(newValue).div(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM);
    if (name === 'beam-value') {
      this.componentParams.beam = newValue;
      this.componentParams.beamStr = this.formateValue(value);
    } else if (name === 'beamx-value') {
      this.componentParams.beamx = newValue;
      this.componentParams.beamxStr = this.formateValue(value);
    } else if (name === 'loaded') {
      this.componentParams.loaded = newValue;
    } else if (name === 'rate') {
      this.componentParams.rate = newValue;
    } else if (name === 'beam_total_locked') {
      this.componentParams.beamTotalLocked = newValue;
      this.componentParams.beamTotalLockedStr = this.formateValue(value);
    }
    this.render();
  }

  
  static get observedAttributes() {
    return ['beam-value', 'beamx-value', 'loaded', 'rate', 'beam_total_locked'];
  }
}

customElements.define('staking-component', StakingComponent);