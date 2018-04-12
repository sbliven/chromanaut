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
    private _selected: C;
    
    // EventTarget function declarations
    addEventListener: (type: EventTypes, listener: EventListenerOrEventListenerObject | null,
                      options?: boolean | AddEventListenerOptions) => void;
    dispatchEvent: (evt: Event) => boolean;
    removeEventListener: (type: EventTypes, listener?: EventListenerOrEventListenerObject | null,
                         options?: EventListenerOptions | boolean) => void;
    
    /**
     * @param selected Initial selected color
     */
    constructor(selected: C) {
        this._selected = selected;
        
        // Create a DOM EventTarget object
        var target: Text = document.createTextNode("");

        // Pass EventTarget interface calls to DOM EventTarget object
        this.addEventListener = target.addEventListener.bind(target);
        this.removeEventListener = target.removeEventListener.bind(target);
        this.dispatchEvent = target.dispatchEvent.bind(target);

    }
    
    get selected(): C {
        return this._selected;
    }
    set selected(color: C) {
        if(color != this._selected) {
            let oldsel = this._selected;
            this._selected = color;
            let evt = new CustomEvent("colorselected", {
                "detail": {"selected": color, "previous": oldsel}
            });
            this.dispatchEvent(evt);
        }
    }
}
//let v = new VisualizerSpace([0,.5,1]);
//v.addEventListener("colorselected",
//(ev: Event) => {
//    let e = ev as CustomEvent;
//    console.log("New: "+e.detail.selected+" Old: "+e.detail.previous);
//});
//v.selected = [1,1,1];