
// TODO: WIP

import { distinct, newEl, range, zip } from "../../index.js";
import { TimetableComponent } from "./TimetableComponent";

/**
 * @typedef {import("./TimetableComponent").TimeRange} TimeRange
 * @typedef {import("./TimetableComponent").Cell} Cell
 */

/**
 * @typedef {Cell & {table?: string}} MultitableCell
 */

export class MultiTimetableComponent {
  /** @private */_tablesLabelElements = /** @type {HTMLElement[]} */([]);
  /** @private */_tablesComponents = /** @type {TimetableComponent[]} */([]);
  /** @private */_tables = /** @type {string[]} */([]);

  /** @private */_cells = /** @type {MultitableCell[]} */([]);
  /** @private */_timeRange =  /** @type {TimeRange} */({ from: 0, to: 24 });
  /** @private */_groups = /** @type {string[]} */([]);

  /**
   * @private
   */
  _renderTables() {
    this._tablesComponents = [];
    this._tablesLabelElements = [];
    this._container.innerHTML = "";

    this._tables.forEach((tableName) => {
      const labelEl = newEl("div", {}, tableName);
      const tableEl = newEl("div");

      this._container.appendChild(labelEl);
      this._container.appendChild(tableEl);

      const tableComponent = new TimetableComponent(tableEl);

      this._tablesLabelElements.push(labelEl);
      this._tablesComponents.push(tableComponent);
    });

    this._renderGroups();
    this._renderTimeRange();
    this._renderCells();
  }

  /**
   * @private 
   */
  _renderGroups() {
    this._tablesComponents.forEach(t => t.setGroups(this._groups));
  }

  /**
   * @private 
   */
  _renderTimeRange() {
    this._tablesComponents.forEach(t => t.setTimeRange(this._timeRange));
  }

  /**
   * @private 
   */
  _renderCells() {
    zip(this._tables, this._tablesComponents).forEach(([tableName, tableComponent]) => {
      tableComponent.setCells(this._cells.filter(x => x.table === tableName));
    });
  }

  /**
   * @param {TimeRange} range 
   */
  setTimeRange(range) {
    this._timeRange = range;
    this._renderTimeRange();
  }

  /**
   * @param {string[]} groups 
   */
  setGroups(groups) {
    this._groups = groups;
    this._renderGroups();
  }

  /**
   * @param {MultitableCell[]} cells 
   */
  setCells(cells) {
    this._cells = cells;
    this._renderCells();
  }

  /**
   * @param {string[]} tables
   */
  setTables(tables) {
    
  }

  setTime() {

  }

  /**
   * @param {HTMLElement} container 
   */
  constructor(container) {
    /** @private */this._container = container;
    this._container.innerHTML = "";

    this.setTimeRange(this._timeRange);
    this.setGroups(this._groups);
  }
}
