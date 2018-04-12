type EventTypes = "colorselected";

/**
 * Models the main colorspace being visualized.
 *
 * Tracks the selected color and notifies viewports and other listeners upon changes.
 * Viewports should update to contain the selected color.
 *
 * @param C Specifies which vector space is used to represent colors (eg Color3)
 */
class VisualizerSpace<C extends Color> implements EventTarget {
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
    
    getRGB(color: C | null): Color3 | null {
        if( color === null) {
            return null;
        }
        return color.slice(0, 3) as Color3;
        
    }
}
//let v = new VisualizerSpace([0,.5,1]);
//v.addEventListener("colorselected",
//(ev: Event) => {
//    let e = ev as CustomEvent;
//    console.log("New: "+e.detail.color+" Old: "+e.detail.oldcolor);
//});
//v.selection = [1,1,1];