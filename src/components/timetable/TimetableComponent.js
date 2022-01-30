import { distinct, newEl, range, zip } from "../../index.js";


/**
 * @typedef {Object} TimeRange
 * @property {number} from
 * @property {number} to
 */

/**
 * @typedef {object} Cell
 * @property {TimeRange} time
 * @property {string} group
 * @property {HTMLElement} element
 */

/**
 * @param {TimeRange} timeRange 
 */
const generateGridTemplateColumns = (timeRange) => {
  return ""
    + "[linie] auto "
    + "["
    + range(timeRange.from, timeRange.to).map(x => `time-${x}] 1fr [time-${x}-end`).join(" ")
    + ` time-${timeRange.to}]`;
};

/**
 * @param {string[]} groups 
 * @param {number[]} tracks 
 */
const generateGridTemplateRows = (groups, tracks) => {
  return ""
    + "auto "
    + "["
    + zip(groups, tracks).map(
      ([group, track]) =>
        range(track+1).map(() => `group-${group}] 1fr [group-${group}-end`).join(" ")
    ).join(" ")
    + "]"
  ;
};


/**
 * returns array of track of indexes. Use for timeRange of cells with same group
 * @param {TimeRange[]} timeRanges
 * @returns {number[]}
 */
const getTracks = (timeRanges) => {
  const timeRangesWIndex = timeRanges.map((x, i) => ({ ...x, i }));
  timeRangesWIndex.sort((a, b) => a.from - b.from);
  const tracks = Array(timeRanges.length);

  let trackIndex = 0;
  while (timeRangesWIndex.length) {
    let popIndex = 0;
    do {
      const { to, i } = timeRangesWIndex.splice(popIndex, 1)[0];
      tracks[i] = trackIndex;
      popIndex = timeRangesWIndex.findIndex(x => x.from >= to);
    } while (popIndex !== -1);
    trackIndex++;
  }

  return tracks;
};

/**
 * @param {Cell[]} cells
 * @returns {number[]}
 */
const getTracksForCells = (cells) => {
  const groups = distinct(cells.map(x => x.group)).sort();
  const tracks = Array(cells.length);
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const cellsWIndex = cells.map((cell, index) => ({ index, cell })).filter(({ cell }) => cell.group === group);
    const groupTracks = getTracks(cellsWIndex.map(x => x.cell.time));
    // TODO: replace zip with faster for loop
    zip(cellsWIndex, groupTracks).forEach(([{ index }, track]) => {
      tracks[index] = track;
    });
  }
  return tracks;
};

/**
 * @param {string[]} groups
 * @param {Cell[]} cells
 * @returns {number[]}
 */
const getTracksForGroups = (groups, cells) => {
  const groupTracks = Array(groups.length);
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const cellTracks = getTracks(cells.filter(x => x.group === group).map(x => x.time));
    groupTracks[gi] = Math.max(...cellTracks, 0);
  }
  return groupTracks;
};


export class TimetableComponent {
  /** @private */_cells = /** @type {Cell[]} */([]);
  /** @private */_timeRange =  /** @type {TimeRange} */({ from: 0, to: 24 });
  /** @private */_groups = /** @type {string[]} */([]);


  /**
   * @private
   * @param {string} className
   */
  _removeChildType(className) {
    Array.from(this._gridEl.querySelectorAll(`:scope > .${className}`)).forEach(x => x.remove());
  }

  /** 
   * @private 
   */
  _renderCells() {
    /** 
     * @param {Cell} cell
     * @param {number} track
     */
    const renderCell = (cell, track) => newEl("div", [
      ["class", "cell"],
      ["style", `grid-row: group-${cell.group} ${track + 1}; grid-column: time-${cell.time.from} / time-${cell.time.to}-end`]
    ], cell.element);

    const tracks = getTracksForCells(this._cells);

    this._removeChildType("cell");
    this._gridEl.append(...zip(this._cells, tracks).map(([cell, track]) => renderCell(cell, track)));
  }

  /**
   * @private
   */
  _rednderTimeRange() {
    /** @param {number} time */
    const renderTime = (time) => newEl("div", [
      ["class", `time time-label-${time}`],
      ["style", `grid-column: time-${time};`]
    ], `${time}:00`);

    const cols = generateGridTemplateColumns(this._timeRange);
    const colElements = range(this._timeRange.from, this._timeRange.to).map(renderTime);

    this._removeChildType("time");
    console.log(cols);
    this._gridEl.style.gridTemplateColumns = cols;
    this._gridEl.append(...colElements);
  }

  _renderGroups() {
    /** @param {string} group */
    const renderGroup = (group) => newEl("div", [
      ["class", `group group-label-${group}`],
      ["style", `grid-row: group-${group} / group-${group}-end -1;`]
    ], `${group}`);

    const tracks = getTracksForGroups(this._groups, this._cells);
    const cols = generateGridTemplateRows(this._groups, tracks);
    const colElements = this._groups.map(x => renderGroup(x));
    
    this._removeChildType("group");
    this._gridEl.style.gridTemplateRows = cols;
    this._gridEl.append(...colElements);
  }


  /**
   * @param {TimeRange} range 
   */
  setTimeRange(range) {
    this._timeRange = range;
    this._rednderTimeRange();
  }

  /**
   * @param {string[]} groups 
   */
  setGroups(groups) {
    this._groups = groups;
    this._renderGroups();
  }


  /**
   * @param {Cell[]} cells 
   */
  setCells(cells) {
    this._cells = cells;

    this._renderCells();
    this._renderGroups();
  }

  setTime() {

  }

  /**
   * @param {HTMLElement} container 
   */
  constructor(container) {
    /** @private */this._container = container;
    /** @private */this._gridEl = newEl("div", [["style", "display: grid;"]]);
    this._container.innerHTML = "";
    this._container.appendChild(this._gridEl);

    this.setTimeRange(this._timeRange);
    this.setGroups(this._groups);
  }
}
