// @ts-check
/*
 * Helper constants and functions
 */

// TODO: all strings - classes etc. defined up

import {newEl} from "./utils.js";

const Keys = {
  Backspace: "Backspace",
  Clear: "Clear",
  Down: "ArrowDown",
  End: "End",
  Enter: "Enter",
  Escape: "Escape",
  Home: "Home",
  Left: "ArrowLeft",
  PageDown: "PageDown",
  PageUp: "PageUp",
  Right: "ArrowRight",
  Space: " ",
  Tab: "Tab",
  Up: "ArrowUp"
};

const MenuActions = {
  Close: 0,
  CloseSelect: 1,
  First: 2,
  Last: 3,
  Next: 4,
  Open: 5,
  Previous: 6,
  Select: 7,
  Space: 8,
  Type: 9
};

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
const filterOptions = (options = [], filter, exclude = []) => {
  return options.filter((option) => {
    const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option) < 0;
  });
};

// return an array of exact option name matches from a comma-separated string
const findMatches = (options, search) => {
  const names = search.split(",");
  return names.map((name) => {
    const match = options.filter((option) => name.trim().toLowerCase() === option.toLowerCase());
    return match.length > 0 ? match[0] : null;
  })
    .filter((option) => option !== null);
};

// return combobox action from key press
const getActionFromKey = (key, menuOpen) => {
  // handle opening when closed
  if (!menuOpen && key === Keys.Down) {
    return MenuActions.Open;
  }

  // handle keys when open
  if (key === Keys.Down) {
    return MenuActions.Next;
  }
  else if (key === Keys.Up) {
    return MenuActions.Previous;
  }
  else if (key === Keys.Home) {
    return MenuActions.First;
  }
  else if (key === Keys.End) {
    return MenuActions.Last;
  }
  else if (key === Keys.Escape) {
    return MenuActions.Close;
  }
  else if (key === Keys.Enter) {
    return MenuActions.CloseSelect;
  }
  else if (key === Keys.Backspace || key === Keys.Clear || key.length === 1) {
    return MenuActions.Type;
  }
};

// get index of option that matches a string
const getIndexByLetter = (options, filter) => {
  const firstMatch = filterOptions(options, filter)[0];
  return firstMatch ? options.indexOf(firstMatch) : -1;
};

// get updated option index
const getUpdatedIndex = (current, max, action) => {
  switch (action) {
  case MenuActions.First:
    return 0;
  case MenuActions.Last:
    return max;
  case MenuActions.Previous:
    return Math.max(0, current - 1);
  case MenuActions.Next:
    return Math.min(max, current + 1);
  default:
    return current;
  }
};



// check if an element is currently scrollable
const isScrollable = (element) => {
  return element && element.clientHeight < element.scrollHeight;
};

// ensure given child element is within the parent's visible scroll area
const maintainScrollVisibility = (activeElement, scrollParent) => {
  const { offsetHeight, offsetTop } = activeElement;
  const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

  const isAbove = offsetTop < scrollTop;
  const isBelow = (offsetTop + offsetHeight) > (scrollTop + parentOffsetHeight);

  if (isAbove) {
    scrollParent.scrollTo(0, offsetTop);
  }
  else if (isBelow) {
    scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
  }
};

// TODO: don't pass index when passing option string
// TODO: rename all combo to multiselect

/**
 * Multiselect
 */
export class MultiselectComponent {

  // #region domCallbacks

  // container callbacks

  _initCallbacks() {
    this.inputEl.addEventListener("input", this._onInput.bind(this));
    this.inputEl.addEventListener("blur", this._onInputBlur.bind(this));
    this.inputEl.addEventListener("click", this._onClick.bind(this));
    this.inputEl.addEventListener("keydown", this._onInputKeyDown.bind(this));
  }

  _onInput() {
    const currentValue = this.inputEl.value;
    this.filterOptions(currentValue);

    // if active option is not in filtered options, set it to first filtered option
    if (this.filteredOptions.indexOf(this.options[this.activeIndex]) < 0) {
      const firstFilteredIndex = this.options.indexOf(this.filteredOptions[0]);
      this._onOptionChange(firstFilteredIndex);
    }

    const menuState = this.filteredOptions.length > 0;
    if (this.open !== menuState) {
      this.updateMenuState(menuState, false);
    }
  }

  _onInputBlur() {
    if (this.ignoreBlur) {
      this.ignoreBlur = false;
      return;
    }

    if (this.open) {
      this.updateMenuState(false, false);
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  _onInputKeyDown(event) {
    const { key } = event;

    const max = this.filteredOptions.length - 1;
    const activeFilteredIndex = this.filteredOptions.indexOf(this.options[this.activeIndex]);

    const action = getActionFromKey(key, this.open);

    switch (action) {
    case MenuActions.Next:
    case MenuActions.Last:
    case MenuActions.First:
    case MenuActions.Previous:
      event.preventDefault();
      const nextFilteredIndex = getUpdatedIndex(activeFilteredIndex, max, action);
      const nextRealIndex = this.options.indexOf(this.filteredOptions[nextFilteredIndex]);
      return this._onOptionChange(nextRealIndex);
    case MenuActions.CloseSelect:
      event.preventDefault();
      return this.updateOptionAt(this.activeIndex);
    case MenuActions.Close:
      event.preventDefault();
      return this.updateMenuState(false);
    case MenuActions.Open:
      return this.updateMenuState(true);
    }
  }

  _onClick() {
    this.updateMenuState(true);
  }

  // option callbacks

  _onOptionMouseDown() {
    this.ignoreBlur = true;
  }

  /**
   * @param {number} index 
   */
  _onOptionClick(index) {
    this._onOptionChange(index);
    this.updateOptionAt(index);
    this.inputEl.focus();
  }

  // #endregion domCallbacks


  // #region domManipulation

  /**
   * @param {Element} container
   */
  static _createMultiselect(container) {
    /**
     * @param {string} type
     * @param {[string, string][]} [attributes]
     * @param {Element[] | Element} [children]
     */

    container.appendChild(
      newEl("ul",
        [["class", "selected-options"]]
      )
    );
    container.appendChild(
      newEl("div",
        [["class", "combo js-multi-buttons"]]
        , [
          newEl("div",
            [
              ["role", "combobox"],
              ["aria-haspopup", "listbox"],
              ["aria-expanded", "false"],
              // TODO: based on ID - use guid
              // ["aria-owns", "listbox2"],
              ["class", "input-wrapper"],
            ]
            , newEl("input",
              [
                ["aria-activedescendant", ""],
                ["aria-autocomplete", "list"],
                ["aria-labelledby", "combo-label combo-selected"],
                // ["id", "combo"],
                ["class", "combo-input"],
                ["type", "text"],
              ]
            )),
          newEl("div",
            [
              ["class", "combo-menu"],
              ["role", "listbox"],
              ["aria-multiselectable", "true"],
              ["id", "listbox2"],
            ]
          )
        ])
    );
  }

  /**
   * @param {string} option
   * @param {number} index
   */
  _createOption(option, index) {
    const optionEl = document.createElement("div");
    optionEl.setAttribute("role", "option");
    optionEl.id = `${this.idBase}-${index}`;
    optionEl.className = index === 0 ? "combo-option option-current" : "combo-option";
    optionEl.setAttribute("aria-selected", "false");
    optionEl.innerText = option;

    optionEl.addEventListener("click", this._onOptionClick.bind(this, index));
    optionEl.addEventListener("mousedown", this._onOptionMouseDown.bind(this));

    this.listboxEl.appendChild(optionEl);
  }

  // TODO: replace with method that removes specific 
  _cleanOptions() {
    this.listboxEl.innerHTML = "";
    this.selectedEl.innerHTML = "";
  }

  /**
   * @param {string[]} options
   */
  setOptions(options) {
    this.deselectAll();
    this._cleanOptions();

    this.options = options;
    this.filteredOptions = options;

    options.map((option, index) => {
      this._createOption(option, index);
    });
  }

  // TODO: all selected manipulation into one region
  deselectAll() {
    [...this.selected].forEach(opt => {
      const index = this.options.findIndex(x => x === opt);
      if (index === -1) return;
      this.deselectOptionAt(index);
    });
    this.selected = [];
  }

  // TODO: use this everywhere
  /**
   * @param {string} opt
   */
  _getIndexOf(opt) {
    return this.options.findIndex(x => x === opt);
  }

  /**
   * @param {string[]} options
   */
  setSelected(options) {
    this.deselectAll();

    this.selected = [];
    options.map(this._getIndexOf.bind(this))
      .filter(x => x >= 0)
      .forEach(this.selectOptionAt.bind(this));
  }

  /**
   * @param {string} option
   * @param {number} index
   */
  _createOptionButton(option, index) {
    const listItem = document.createElement("li");
    const buttonEl = document.createElement("button");
    buttonEl.className = "remove-option";
    buttonEl.type = "button";
    buttonEl.id = `${this.idBase}-remove-${index}`;
    buttonEl.setAttribute("aria-describedby", `${this.idBase}-remove`);
    buttonEl.addEventListener("click", this.deselectOptionAt.bind(this, index));
    buttonEl.innerHTML = option + " ";

    listItem.appendChild(buttonEl);
    this.selectedEl.appendChild(listItem);
  }


  // #endregion domManipulation 


  /**
   * hide/show options based on filtering
   * @param {string} value 
   */
  filterOptions(value) {
    this.filteredOptions = filterOptions(this.options, value);

    /** @type {HTMLOptionElement[]} */
    const options = Array.from(this.el.querySelectorAll("[role=option]"));
    options.forEach((optionEl) => {
      const value = optionEl.innerText;
      if (this.filteredOptions.indexOf(value) > -1) {
        optionEl.style.display = "block";
      }
      else {
        optionEl.style.display = "none";
      }
    });
  }

  /**
   * change focused html option element (arrows movement)
   * @param {number} index 
   */
  _onOptionChange(index) {
    this.activeIndex = index;
    this.inputEl.setAttribute("aria-activedescendant", `${this.idBase}-${index}`);

    // update active style
    const options = this.el.querySelectorAll("[role=option]");
    [...options].forEach((optionEl) => {
      optionEl.classList.remove("option-current");
    });
    options[index].classList.add("option-current");

    if (this.open && isScrollable(this.listboxEl)) {
      maintainScrollVisibility(options[index], this.listboxEl);
    }
  }

  /**
   * @param {number} index 
   */
  deselectOptionAt(index) {
    const option = this.options[index];

    const ix = this.selected.findIndex(x => x === option);
    if (ix >= 0)
      this.selected.splice(ix, 1);

    // update aria-selected
    const options = this.el.querySelectorAll("[role=option]");
    options[index].setAttribute("aria-selected", "false");
    options[index].classList.remove("option-selected");

    // remove button
    const buttonEl = document.getElementById(`${this.idBase}-remove-${index}`);
    this.selectedEl.removeChild(buttonEl.parentElement);

    this._dispatchOnSelectionChanged();
  }

  // TODO: change direction of arrow when opened (animation) ?
  /**
   * @param {number} index 
   */
  selectOptionAt(index) {
    const option = this.options[index];
    this.activeIndex = index;

    this.selected.push(option);
    this.selected.sort();

    // update aria-selected
    const options = this.el.querySelectorAll("[role=option]");
    options[index].setAttribute("aria-selected", "true");
    options[index].classList.add("option-selected");

    // add remove option button
    this._createOptionButton(option, index);

    this._dispatchOnSelectionChanged();
  }

  /**
   * @param {number} index 
   */
  updateOptionAt(index) {
    const option = this.options[index];
    const optionEls = this.el.querySelectorAll("[role=option]");
    const optionEl = optionEls[index];
    const isSelected = optionEl.getAttribute("aria-selected") === "true";

    if (isSelected)
      this.deselectOptionAt(index);
    else
      this.selectOptionAt(index);

    this.inputEl.value = "";
    this.filterOptions("");
  }

  /**
   * @param {boolean} open
   * @param {boolean} [callFocus]
   */
  updateMenuState(open, callFocus = true) {
    this.open = open;

    this.comboEl.setAttribute("aria-expanded", `${open}`);
    open ? this.el.classList.add("open") : this.el.classList.remove("open");
    callFocus && this.inputEl.focus();
  }

  _dispatchOnSelectionChanged() {
    this.onSelectionChanged?.([...this.selected]);
  }

  /**
   * @type {(v: string[]) => void}
   */
  onSelectionChanged = () => { };

  /**
   * @param {Element} container - The x value.
   */
  constructor(container) {
    this.container = container;
    if (!container.children.length)
      MultiselectComponent._createMultiselect(container);
    this.el = container.querySelector(".js-multi-buttons");
    this.comboEl = container.querySelector("[role=combobox]");
    this.inputEl = container.querySelector("input");
    this.listboxEl = container.querySelector("[role=listbox]");
    this.selectedEl = container.querySelector(".selected-options");

    this.idBase = this.inputEl.id;

    this.activeIndex = 0;
    this.open = false;
    this.selected = [];

    this._initCallbacks();
  }
}

// TODO: when no option selected, there can be button with label which opens and focus menu on click
// TODO: close menu on enter when nothing selected
// TODO: when using enter to check/uncheck (maybe only when using search) blur select

// TODO: minify build ... babel compile to ES5 ?
// TODO: selec buttons should not be selectable

