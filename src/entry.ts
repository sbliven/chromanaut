export * from "./chromanaut/main";
export * from "./chromanaut/viewport";
export * from "./chromanaut/selection";
export * from "./chromanaut/color";

// expose color-spaces module
import * as cs from "color-space";
export let spaces = cs;