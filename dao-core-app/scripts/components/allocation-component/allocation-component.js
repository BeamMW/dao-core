import * as consts from "./../../consts/consts.js";

class AllocationComponent extends HTMLElement {
    componentParams = {
      allocated: 0,
      distributed: 0,
      available: 0,
      locked: 0,
      total: 0,
      totalStr: '0',
      lockedStr: '0',
      allocatedStr: '0',
      distributedStr: '0',
      availableStr: '0'
    }

    constructor() {
      super();
    }

    getTemplate() {
      const TEMPLATE =
      `<div class="allocation">
          <div class="container__header">INVESTOR ALLOCATION</div>
          <div class="container__content">
            <div class="allocation__stats">
                <div class="allocation__stats__allocated">
                    <div class="allocation-title">Allocated</div>
                    <div class="allocated-value">1,000,000 BEAMX</div>
                </div>
                <div class="allocation-total-temporary">
                    <div class="allocation__stats__vested">
                        <div class="allocation-title">Total vested</div>
                        <div class="vested-value"> ${this.componentParams.totalStr} BEAMX</div>
                    </div>
                    <div class="farmed-claim" id="allocation-claim">
                        <img class="farmed-claim__icon" src="./icons/icon-star.svg">
                        <span class="farmed-claim__text">claim</span>
                    </div>
                </div>
            </div>
            <div class="allocation__calculated">
                <div class="allocation__calculated__content">
                    <div class="allocation__calculated__content__distributed">
                        <div class="allocation-title">Distributed</div>
                        <div class="distributed-value">${this.componentParams.distributedStr} BEAMX</div>
                    </div>
                    <div class="allocation__calculated__content__available">
                        <div class="allocation-title">Available</div>
                        <div class="available-value">${this.componentParams.availableStr} BEAMX</div>
                    </div>
                    <div class="allocation__calculated__content__locked">
                        <div class="allocation-title">Locked</div>
                        <div class="locked-value"> ${this.componentParams.lockedStr} BEAMX</div>
                    </div>
                </div>
                <div class="allocation__calculated__graph" id="allocation-progress">
                    <div class="allocation__calculated__graph__value" id="allocation-progress-value"></div>
                    <div class="allocation__calculated__graph__available" id="allocation-progress-available"></div>
                </div>
            </div>
          </div>
      </div>`;

      return this.componentParams.total > 0 ? TEMPLATE : '';
    }
  
    render() {
        this.innerHTML = this.getTemplate();
        const progressWidth = this.componentParams.total > 0 && this.componentParams.distributed > 0 
            ? Math.ceil($('#allocation-progress').width() * 
                (this.componentParams.distributed / this.componentParams.total)) + 'px'
            : 0;
        $('#allocation-progress-value').width(progressWidth);

        const availablePosition = this.componentParams.total > 0 && this.componentParams.distributed > 0
            ? Math.ceil($('#allocation-progress').width() *
                (this.componentParams.locked / this.componentParams.total)) + 'px'
            : 0;
        $('#allocation-progress-available').css('margin-left',availablePosition);

        $('#allocation-claim').click(() => {
            let event = new CustomEvent("global-event", {
                detail: {
                  type: 'withdraw-popup-open',
                  is_allocation: true
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
            case 'total':
                this.componentParams.total = newValue;
                value = Big(newValue).div(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM);
                this.componentParams.totalStr = value.toFixed();
                this.render();

                break;
            case 'avail_total':
                this.componentParams.available = newValue;
                value = Big(newValue).div(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM);
                this.componentParams.availableStr = value.toFixed();
                this.render();

                break;
            case 'received':
                this.componentParams.distributed = newValue;
                value = Big(newValue).div(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM);
                this.componentParams.distributedStr = value.toFixed();
                this.render();

                break;
            case 'avail_remaining':
                this.componentParams.locked = newValue;
                value = Big(newValue).div(consts.GLOBAL_CONSTS.GROTHS_IN_BEAM);
                this.componentParams.lockedStr = value.toFixed();
                this.render();

                break;
        }
    }
  
    
    static get observedAttributes() {
      return ['total', 'received', 'avail_total', 'avail_remaining'];
    }
  }

  customElements.define('allocation-component', AllocationComponent);


  
//   total='0'
//   received='0'
//   avail_total='0'
//   avail_remaining='0'