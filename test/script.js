import {MultiselectComponent} from "../src/MultiselectComponent.js";
import {options} from "./options.js";

// init multiselect w/ top buttons
const multiButtonEl = document.querySelector("#multiselect");

const multiButtonComponent = new MultiselectComponent(multiButtonEl);
multiButtonComponent.setOptions(options);
multiButtonComponent.onSelectionChanged = (s) => { console.log(s); };

multiButtonComponent.setSelected(options.slice(0, 5));

// init multiselect w/ top buttons
const multiButton2El = document.querySelector("#multiselect2");

const multiButton2Component = new MultiselectComponent(multiButton2El);
multiButton2Component.setOptions(options);
multiButton2Component.onSelectionChanged = (s) => { console.log(s); };

multiButton2Component.setSelected(options.slice(0, 5));

