import { newEl } from "../../index.js";

/**
 * @typedef {object} Option
 * @property {string} value
 * @property {string} label
 */

/**
 * @typedef {Object} OptGroup
 * @property {string} [label]
 * @property {Option[]} options
 */


/**
 * @param {Option | OptGroup} opt
 * @returns {opt is Option}
 */
const isOption = (opt) => {
  const keys = Object.keys(opt);
  return keys.some(x => x === "value") && keys.some(x => x === "label");
};

export class SelectComponent {
  /** @private */_optionsTree = /** @type {(Option | OptGroup)[]} */([]);
  /** @private */_optionsAll = /** @type {Option[]} */([]);
  /** @private */_selectedValue = "";

  /**
   * @param {string} v 
   */
  setSelected(v) {
    this._selectedValue = v;
    const optionElement = /** @type {HTMLOptionElement} */(this._selectEl.querySelector(`[value="${v}"]`));
    if (optionElement) {
      optionElement.selected = true;
    }

    this._dispatchOnSelectionChanged();
  }

  /** @type {(v:string) => void} */
  onSelectionChanged = () => undefined;

  /** @private */
  _dispatchOnSelectionChanged() {
    this.onSelectionChanged(this._selectedValue);
  }

  /** 
   * @private 
   */
  _renderOptions() {
    /** @param {Option} opt */const createOption =
      (opt) => newEl("option", [["value", opt.value]], `${opt.label}`);
    /** @param {OptGroup} optgroup */const createOptGroup =
      (optgroup) => newEl("optgroup",
        optgroup?.label ? [["label", optgroup.label]] : [],
        optgroup.options.map(createOption)
      );
    /** @param {Option | OptGroup} opt */const createOptionOrGroup =
      (opt) => isOption(opt) ? createOption(opt) : createOptGroup(opt);

    this._selectEl.innerHTML = "";
    this._selectEl.append(...this._optionsTree.map(createOptionOrGroup));
  }

  /**
   * 
   * @param {(Option | OptGroup)[]} optionsTree 
   */
  setOptions(optionsTree) {
    this._optionsTree = optionsTree;
    this._optionsFlat = optionsTree.reduce(
      (arr, opt) => arr.concat(...(isOption(opt) ? [opt] : opt.options)),
      /** @type {Option[]} */([])
    );

    this._renderOptions();

    if (this._optionsFlat?.length){
      this.setSelected(`${this._optionsFlat[0].value}`);
    }
  }

  /**
   * @param {HTMLElement} container 
   */
  constructor(container) {
    /** @private */this._container = container;
    /** @private */this._selectEl = newEl("select");
    this._container.innerHTML = "";
    this._container.appendChild(this._selectEl);

    this._selectEl.addEventListener("change", (ev) => {
      // @ts-ignore
      this._selectedValue = (ev.target.value);
      this._dispatchOnSelectionChanged();
    });
  }
}
