import {Color} from "./color";
import {colorspace} from "color-space";

import * as cs1 from "color-space";
export let cs = cs1;

type EventTypes = "colorselected";

/**
 * Tracks a selected color, allowing coordination between several viewports.
 *
 * Tracks the selected color and notifies viewports and other listeners upon changes.
 * Viewports should update to contain the selected color.
 */
export class SelectionManager implements EventTarget {
    private _selection: Color;
    public readonly space: colorspace;
    
    // EventTarget function declarations
    addEventListener: (type: EventTypes, listener: EventListenerOrEventListenerObject | null,
                      options?: boolean | AddEventListenerOptions) => void;
    dispatchEvent: (evt: Event) => boolean;
    removeEventListener: (type: EventTypes, listener?: EventListenerOrEventListenerObject | null,
                         options?: EventListenerOptions | boolean) => void;
    
    /**
     * @param selection Initial selected color
     */
    constructor(selection: Color, space: colorspace) {
        this._selection = selection;
        this.space = space;
        
        // Check that the selection and space are compatible
        if(selection.length != space.min.length) {
            throw "Incompatible selection tuple (" + selection.length
                + ") for this space (" + space.min.length + ")";
        }

        // Create a DOM EventTarget object
        var target: Text = document.createTextNode("");

        // Pass EventTarget interface calls to DOM EventTarget object
        this.addEventListener = target.addEventListener.bind(target);
        this.removeEventListener = target.removeEventListener.bind(target);
        this.dispatchEvent = target.dispatchEvent.bind(target);
    }
    
    get selection(): Color {
        return this._selection;
    }
    set selection(color: Color) {
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
