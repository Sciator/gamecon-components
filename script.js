
// init multiselect w/ top buttons
const multiButtonEl = document.querySelector('#multiselect');

const multiButtonComponent = new MultiselectButtons(multiButtonEl);
multiButtonComponent.setOptions(options)
multiButtonComponent.onSelectionChanged = (s) => { console.log(s) }

multiButtonComponent.setSelected(options.slice(0, 5))
