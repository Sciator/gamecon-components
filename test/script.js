import {MultiselectComponent} from "../src/index.js";
import {options} from "./options.js";

// init multiselect w/ top buttons
const multiselectElement = document.querySelector("#multiselect");
const multiselectButtonElement = document.querySelector("#multiselect-btn");

const multiselectComponent = new MultiselectComponent(multiselectElement, multiselectButtonElement);

multiselectComponent.setOptions(options);
multiselectComponent.onSelectionChanged = (s) => { console.log(s); };

multiselectComponent.setSelected(options.slice(0, 5));

// init multiselect w/ top buttons
const multiselect2El = document.querySelector("#multiselect2");

const multiselect2Component = new MultiselectComponent(multiselect2El);
multiselect2Component.setOptions(options);
multiselect2Component.onSelectionChanged = (s) => { console.log(s); };

multiselect2Component.setSelected(options.slice(0, 5));

