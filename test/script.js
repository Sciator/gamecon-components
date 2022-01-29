import {MultiselectComponent} from "../src/MultiselectComponent.js";
import {options} from "./options.js";

// init multiselect w/ top buttons
const multiButtonEl = document.querySelector("#multiselect");

const multiButtonComponent = new MultiselectComponent(multiButtonEl);
multiButtonComponent.setOptions(options);
multiButtonComponent.onSelectionChanged = (s) => { console.log(s); };

multiButtonComponent.setSelected(options.slice(0, 5));
