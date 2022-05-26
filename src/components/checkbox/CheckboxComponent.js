import { newEl } from "../../index.js";


export class CheckboxComponent {
  /** @private */_checked = false;

  /**
   * @param {boolean} v 
   */
  setChecked(v) {
    if (v === this._checked)
      return;

    this._checked = v;
    this._inputEl.checked = v;
    this._dispatchOnChanged();
  }

  /** @type {(v:boolean) => void} */
  onChanged = () => undefined;

  /** @private */
  _dispatchOnChanged() {
    this.onChanged(this._checked);
  }

  /**
   * @param {HTMLElement} container 
   */
  constructor(container) {
    /** @private */this._container = container;
    /** @private */this._inputEl = newEl("input", [["type", "checkbox"]]);
    this._container.innerHTML = "";
    this._container.appendChild(this._inputEl);

    this._inputEl.addEventListener("change", (ev) => {
      // @ts-ignore
      this._checked = (ev.target.checked);
      this._dispatchOnChanged();
    });
  }
}

