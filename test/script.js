import { CheckboxComponent, TimetableComponent, MultiselectComponent, newEl, SelectComponent } from "../src/index.js";
import { options } from "./options.js";

// init multiselect w/ top buttons
const multiselectElement = document.querySelector("#multiselect");
const multiselectButtonElement = document.querySelector("#multiselect-btn");

const multiselectComponent = new MultiselectComponent(multiselectElement, multiselectButtonElement);

multiselectComponent.setOptions(options);
multiselectComponent.onSelectionChanged = (s) => { console.log(s); };

multiselectComponent.setSelected(options.slice(0, 5));

// init multiselect w/ top buttons
const multiselect2Element = document.querySelector("#multiselect2");
const multiselectButton2Element = document.querySelector("#multiselect2-btn");

const multiselect2Component = new MultiselectComponent(multiselect2Element, multiselectButton2Element);
multiselect2Component.setOptions(options);
multiselect2Component.onSelectionChanged = (s) => { console.log(s); };

multiselect2Component.setSelected(options.slice(0, 5));


const selectElement = document.querySelector("#select");
const selectCoponent = new SelectComponent(selectElement);

selectCoponent.onSelectionChanged = (v) => { console.log(v); };

selectCoponent.setOptions([
  { value: 2019, label: "Rok 2019" },
  { value: "vedu", label: "Vedu" },
  { value: "mujprogram", label: "Můj program" },
  {
    options: [
      { value: 2019, label: "Rok 2019" },
      { value: 2018, label: "Rok 2018" },
      { value: 2017, label: "Rok 2017" },
      { value: 2016, label: "Rok 2016" },
      { value: 2015, label: "Rok 2015" },
    ],
  }
]);


const checkboxElement = document.querySelector("#checkbox");
const chechboxComponent = new CheckboxComponent(checkboxElement);

chechboxComponent.onChanged = (b) => console.log(b);

chechboxComponent.setChecked(true);


const timetableElement = document.querySelector("#grid");
const timetableComponent = new TimetableComponent(timetableElement);

// timetableComponent.setCells(range(10).map(x => ({ element: newEl("div", [], `x:${x}`), rect: { x: 0, y: x } })));

timetableComponent.setTimeRange({ from: 8, to: 21 });
timetableComponent.setGroups(["Epic", "Wargaming", "Deskoherna"]);
timetableComponent.setCells([
  {
    element: newEl("div", [["style", "background-color: gray"]], "WG 11-12"), group: "Wargaming", time: { from: 9, to: 13 }
  },
  {
    element: newEl("div", [["style", "background-color: gray"]], "WG 11-12"), group: "Wargaming", time: { from: 13, to: 23 }
  },
  {
    element: newEl("div", [["style", "background-color: gray"]], "WG 11-12"), group: "Wargaming", time: { from: 9, to: 13 }
  },
]);

