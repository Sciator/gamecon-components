/*
 * Helper constants and functions
 */

// make it easier for ourselves by putting some values in objects
// in TypeScript, these would be enums
const Keys = {
  Backspace: 'Backspace',
  Clear: 'Clear',
  Down: 'ArrowDown',
  End: 'End',
  Enter: 'Enter',
  Escape: 'Escape',
  Home: 'Home',
  Left: 'ArrowLeft',
  PageDown: 'PageDown',
  PageUp: 'PageUp',
  Right: 'ArrowRight',
  Space: ' ',
  Tab: 'Tab',
  Up: 'ArrowUp'
}

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
}

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
const filterOptions = (options = [], filter, exclude = []) => {
  return options.filter((option) => {
    const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option) < 0;
  });
}

// return an array of exact option name matches from a comma-separated string
const findMatches = (options, search) => {
  const names = search.split(',');
  return names.map((name) => {
    const match = options.filter((option) => name.trim().toLowerCase() === option.toLowerCase());
    return match.length > 0 ? match[0] : null;
  })
    .filter((option) => option !== null);
}

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
}

// get index of option that matches a string
const getIndexByLetter = (options, filter) => {
  const firstMatch = filterOptions(options, filter)[0];
  return firstMatch ? options.indexOf(firstMatch) : -1;
}

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
}

// check if an element is currently scrollable
const isScrollable = (element) => {
  return element && element.clientHeight < element.scrollHeight;
}

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
}

// TODO: don't pass index when passing option string

/*
 * Multiselect Combobox w/ Buttons code
 */
class MultiselectButtons {
  init() {
    this._initCallbacks()

    this.options.map((option, index) => {
      this._createOption(option, index)
    });
  }

  // #region domCallbacks

  // container callbacks

  _initCallbacks() {
    this.inputEl.addEventListener('input', this._onInput.bind(this));
    this.inputEl.addEventListener('blur', this._onInputBlur.bind(this));
    this.inputEl.addEventListener('click', this._onClick.bind(this));
    this.inputEl.addEventListener('keydown', this._onInputKeyDown.bind(this));
  }

  _onInput() {
    const currentValue = this.inputEl.value;
    this.filterOptions(currentValue);

    // if active option is not in filtered options, set it to first filtered option
    if (this.filteredOptions.indexOf(this.options[this.activeIndex]) < 0) {
      const firstFilteredIndex = this.options.indexOf(this.filteredOptions[0]);
      this.onOptionChange(firstFilteredIndex);
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
        return this.onOptionChange(nextRealIndex);
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
    this.updateMenuState(true)
  }

  // option callbacks

  _onOptionMouseDown() {
    this.ignoreBlur = true;
  }

  /**
   * 
   * @param {number} index 
   */
  _onOptionClick(index) {
    this.onOptionChange(index);
    this.updateOptionAt(index);
    this.inputEl.focus();
  }

  // #endregion domCallbacks


  // #region domManipulation

  /**
   * @param {string} option
   * @param {number} index
   */
  _createOption(option, index) {
    const optionEl = document.createElement('div');
    optionEl.setAttribute('role', 'option');
    optionEl.id = `${this.idBase}-${index}`;
    optionEl.className = index === 0 ? 'combo-option option-current' : 'combo-option';
    optionEl.setAttribute('aria-selected', 'false');
    optionEl.innerText = option;

    optionEl.addEventListener('click', this._onOptionClick.bind(this, index));
    optionEl.addEventListener('mousedown', this._onOptionMouseDown.bind(this));

    this.listboxEl.appendChild(optionEl);
  }

  /**
   * @param {string} option
   * @param {number} index
   */
  _createOptionButton(option, index) {
    const listItem = document.createElement('li');
    const buttonEl = document.createElement('button');
    buttonEl.className = 'remove-option';
    buttonEl.type = 'button';
    buttonEl.id = `${this.idBase}-remove-${index}`;
    buttonEl.setAttribute('aria-describedby', `${this.idBase}-remove`);
    buttonEl.addEventListener('click', this.deselectOptionAtAt.bind(this, index));
    buttonEl.innerHTML = option + ' ';

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

    const options = this.el.querySelectorAll('[role=option]');
    [...options].forEach((optionEl) => {
      const value = optionEl.innerText;
      if (this.filteredOptions.indexOf(value) > -1) {
        optionEl.style.display = 'block';
      }
      else {
        optionEl.style.display = 'none';
      }
    });
  }

  /**
   * 
   * @param {number} index 
   */
  onOptionChange(index) {
    this.activeIndex = index;
    this.inputEl.setAttribute('aria-activedescendant', `${this.idBase}-${index}`);

    // update active style
    const options = this.el.querySelectorAll('[role=option]');
    [...options].forEach((optionEl) => {
      optionEl.classList.remove('option-current');
    });
    options[index].classList.add('option-current');

    if (this.open && isScrollable(this.listboxEl)) {
      maintainScrollVisibility(options[index], this.listboxEl);
    }
  }

  /**
   * 
   * @param {number} index 
   */
  deselectOptionAtAt(index) {
    const option = this.options[index];

    // update aria-selected
    const options = this.el.querySelectorAll('[role=option]');
    options[index].setAttribute('aria-selected', 'false');
    options[index].classList.remove('option-selected');

    // remove button
    const buttonEl = document.getElementById(`${this.idBase}-remove-${index}`);
    this.selectedEl.removeChild(buttonEl.parentElement);
  }

  /**
   * 
   * @param {number} index 
   */
  selectOptionAt(index) {
    const option = this.options[index];
    this.activeIndex = index;

    // update aria-selected
    const options = this.el.querySelectorAll('[role=option]');
    options[index].setAttribute('aria-selected', 'true');
    options[index].classList.add('option-selected');

    // add remove option button
    this._createOptionButton(option, index)
  }

  /**
   * 
   * @param {number} index 
   */
  updateOptionAt(index) {
    const option = this.options[index];
    const optionEls = this.el.querySelectorAll('[role=option]');
    const optionEl = optionEls[index];
    const isSelected = optionEl.getAttribute('aria-selected') === 'true';

    if (isSelected)
      this.deselectOptionAtAt(index);
    else
      this.selectOptionAt(index);

    this.inputEl.value = '';
    this.filterOptions('');
  }

  updateMenuState(open, callFocus = true) {
    this.open = open;

    this.comboEl.setAttribute('aria-expanded', `${open}`);
    open ? this.el.classList.add('open') : this.el.classList.remove('open');
    callFocus && this.inputEl.focus();
  }

  /**
   * @param {Element} el - The x value.
   * @param {string[]} options - The y value.
   */
  constructor(el, options) {
    this.el = el;
    this.comboEl = el.querySelector('[role=combobox]');
    this.inputEl = el.querySelector('input');
    this.listboxEl = el.querySelector('[role=listbox]');

    this.idBase = this.inputEl.id;
    this.selectedEl = document.getElementById(`${this.idBase}-selected`);

    // data
    this.options = options;
    this.filteredOptions = options;

    // state
    this.activeIndex = 0;
    this.open = false;
  }
}


// init multiselect w/ top buttons
const multiButtonEl = document.querySelector('.js-multi-buttons');
const multiButtonComponent = new MultiselectButtons(multiButtonEl, options);
multiButtonComponent.init();
