import {Color} from "./color";
import * as cs from "color-space";
import * as ch from "chroma-js";

//export let cs = colorspace;
export let chroma:any = ch;
export let colorspace:any = cs;

type EventTypes = "colorselected";

/**
 * Tracks a selected color, allowing coordination between several viewports.
 *
 * Tracks the selected color and notifies viewports and other listeners upon changes.
 * Viewports should update to contain the selected color.
 *
 * @param C Specifies which vector space is used to represent colors (eg Color3)
 */
export class SelectionManager<C extends Color> implements EventTarget {
    private _selection: C;
    
    // EventTarget function declarations
    addEventListener: (type: EventTypes, listener: EventListenerOrEventListenerObject | null,
                      options?: boolean | AddEventListenerOptions) => void;
    dispatchEvent: (evt: Event) => boolean;
    removeEventListener: (type: EventTypes, listener?: EventListenerOrEventListenerObject | null,
                         options?: EventListenerOptions | boolean) => void;
    
    /**
     * @param selection Initial selected color
     */
    constructor(selection: C) {
        this._selection = selection;
        
        // Create a DOM EventTarget object
        var target: Text = document.createTextNode("");

        // Pass EventTarget interface calls to DOM EventTarget object
        this.addEventListener = target.addEventListener.bind(target);
        this.removeEventListener = target.removeEventListener.bind(target);
        this.dispatchEvent = target.dispatchEvent.bind(target);
    }
    
    get selection(): C {
        return this._selection;
    }
    set selection(color: C) {
        if(color != this._selection) {
            let oldsel = this._selection;
            this._selection = color;
            let evt = new CustomEvent("colorselected", {
                "detail": {"color": color, "oldcolor": oldsel}
            });
            this.dispatchEvent(evt);
        }
    }
}
//let v = new SelectionManager([0,.5,1]);
//v.addEventListener("colorselected",
//(ev: Event) => {
//    let e = ev as CustomEvent;
//    console.log("New: "+e.detail.color+" Old: "+e.detail.oldcolor);
//});
//v.selection = [1,1,1];
