import { newEl } from "../Multiselect/utils";

type Rect = {
  x: number, y: number,
  w?: number, h?: number
}

export class GridComponent {
  private _container: HTMLElement;

  clear() {
    this._container.innerHTML = "";
  }

  setCell(rect: Rect, element: HTMLElement) {
    this._container.append(newEl("div", [], element))
  }

  constructor(element: HTMLElement) {
    this._container = element;

  }
}

