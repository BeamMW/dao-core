const MIN_AMOUNT = 0.00000001;
const MAX_AMOUNT = 254000000;

export default class Utils {
    static reload () {
        window.location.reload()
    }

    //
    // API Exposed by the wallet itself
    //
    BEAM = null

    static onLoad(cback) {
        window.addEventListener('load', () => new QWebChannel(qt.webChannelTransport, (channel) => {
            Utils.BEAM = channel.objects.BEAM
            this.loadStyles();
            // Notify application
            cback(Utils.BEAM)
        }))
    }

    static loadStyles() {
        let topColor =  [this.BEAM.style.appsGradientOffset, "px,"].join('')
        let mainColor = [this.BEAM.style.appsGradientTop, "px,"].join('')
        document.body.style.color = this.BEAM.style.content_main
        document.querySelectorAll('.popup').forEach(item => {
            item.style.backgroundImage = `linear-gradient(to bottom, 
                ${this.hex2rgba(this.BEAM.style.background_main_top, 0.6)} ${topColor}
                ${this.hex2rgba(this.BEAM.style.background_main, 0.6)} ${mainColor}
                ${this.hex2rgba(this.BEAM.style.background_main, 0.6)}`;
        });
        document.querySelectorAll('.popup__content').forEach(item => {
            item.style.backgroundColor = this.hex2rgba(this.BEAM.style.background_popup, 1);
        });
    }

    static hex2rgba = (hex, alpha = 1) => {
        const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
        return `rgba(${r},${g},${b},${alpha})`;
    };

    static getById = (id)  => {
        return document.getElementById(id);
    }
    
    static setText(id, text) {
        Utils.getById(id).innerText = text
    }

    static show(id) {
        this.getById(id).classList.remove("hidden");
    }
    
    static hide(id) {
        this.getById(id).classList.add("hidden");
    }

    static callApi(callid, method, params) {
        let request = {
            "jsonrpc": "2.0",
            "id":      callid,
            "method":  method,
            "params":  params
        }
        Utils.BEAM.api.callWalletApi(JSON.stringify(request))
    }

    static download(url, cback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    let buffer    = xhr.response
                    let byteArray = new Uint8Array(buffer);
                    let array     = Array.from(byteArray)

                    if (!array || !array.length) {
                        return cback("empty shader")
                    }
                
                    return cback(null, array)
                } else {
                    let errMsg = ["code", xhr.status].join(" ")
                    return cback(errMsg)
                }
            }
        }
        xhr.open('GET', url, true)
        xhr.responseType = "arraybuffer";
        xhr.send(null)
    }

    static handleString(next) {
        let result = true;
        const regex = new RegExp(/^-?\d+(\.\d*)?$/g);
        const floatValue = parseFloat(next);
        const afterDot = next.indexOf('.') > 0 ? next.substring(next.indexOf('.') + 1) : '0';
        if ((next && !String(next).match(regex)) ||
            (String(next).length > 1 && String(next)[0] === '0' && next.indexOf('.') < 0) ||
            (parseInt(afterDot, 10) === 0 && afterDot.length > 7) ||
            (afterDot.length > 8) ||
            (floatValue === 0 && next.length > 1 && next[1] !== '.') ||
            (floatValue < 1 && next.length > 10) ||
            (floatValue > 0 && (floatValue < MIN_AMOUNT || floatValue > MAX_AMOUNT))) {
          result = false;
        }
        return result;
    }
}
