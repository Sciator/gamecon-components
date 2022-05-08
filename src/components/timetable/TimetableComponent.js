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
 * @typedef {"vDalsiVlne"|"vBudoucnu"|"plno"|"prihlasen"|"nahradnik"|"organizator"} ActivityStatus
 */

/**
 * @param {string} group
 * @param {TimeRange} time
 * @param {object} activity
 * @param {ActivityStatus} activity.status
 * @param {number} activity.id
 * @param {string} activity.title
 * @returns {Cell}
 */
export const createCell = (group, time, activity) => {
  const element = newEl("div", { class: activity?.status }, [
    newEl("a", {
      href: "https://2021.gamecon.cz/turnaje#starnet-fotbal",
      target: "_blank",
      class: "programNahled_odkaz",
      "data-program-nahled-id": `${activity.id ?? -1}`,
      title: activity.title ?? "",
    }, activity.title ?? ""),
    newEl("span", { class: "program_obsazenost" },
      // TODO: podle pohlaví  <span class="program_obsazenost"> <span class="f">(1/2)</span> <span class="m">(5/5)</span></span>
      newEl("span", { class: "neprihlasovatelna" },
        "(0/24)"
      )
    )
  ]);

  return { element, group, time };
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
 * Track is table row relative to given group. For example cell with track 3 will be at table row where its group starting + 3
 * @param {Cell[]} cells
 * @returns {{tracks: number[], groupTracksLen: Record<string, number>}}
 */
const getTracksForCells = (cells) => {
  const groups = distinct(cells.map(x => x.group)).sort();
  /** @type {number[]} */
  const tracks = Array(cells.length);
  /** @type {Record<string, number>} */
  const groupTracksLen = {};
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    const cellsWIndex = cells.map((cell, index) => ({ index, cell })).filter(({ cell }) => cell.group === group);
    const groupTracks = getTracks(cellsWIndex.map(x => x.cell.time));
    // TODO: replace zip with faster for loop
    zip(cellsWIndex, groupTracks).forEach(([{ index }, track]) => {
      tracks[index] = track;
    });
    groupTracksLen[group] = Math.max(...groupTracks);
  }
  return { tracks, groupTracksLen };
};

/**
 * @typedef {object} StructureCell
 * @property {number} [span]
 * @property {(Node|string)} [content]
 * @property {true} [header]
 */

/**
 * 
 * @param {Cell[]} cells
 * @param {string[]} groups
 * @param {TimeRange} timeRange
 * @return {StructureCell[][]}
 */
const getTableStructure = (cells, groups, timeRange) => {
  /** @type {StructureCell[][]} */
  const table = [];

  const { tracks, groupTracksLen } = getTracksForCells(cells);

  {
    /** @type {StructureCell[]} */
    const headerRow = [{}];
    range(timeRange.from, timeRange.to + 1)
      .forEach(x => headerRow.push({ content: `${x}` }));
    table.push(headerRow);
  }

  groups.forEach(group => {
    const maxTrack = groupTracksLen[group] || 0;
    range(maxTrack + 1).map(track => {
      /** @type {({span?:number, content?:Node|string, header?: true})[]} */
      const row = track ? [] : [{ content: group, span: maxTrack + 1, header: true }];
      const c = zip(cells, tracks)
        .filter(([, t]) => t === track)
        .map(([cell]) => cell)
        .filter(cell => cell.group === group)
        .sort((a, b) => a.time.from - b.time.from)
        ;
      range(timeRange.from, timeRange.to + 1).forEach(t => {
        if (c[0] && c[0].time.to <= t) c.splice(0, 1);
        const cell = c[0];
        if (cell) {
          if (cell.time.from === t) {
            row.push({ span: cell.time.to - cell.time.from, content: cell.element });
          } else if (cell.time.from > t) {
            row.push({});
          }
        } else {
          row.push({});
        }
      });
      table.push(row);
    });
  });

  return table;
};


export class TimetableComponent {
  /** @private */_cells = /** @type {Cell[]} */([]);
  /** @private */_timeRange =  /** @type {TimeRange} */({ from: 0, to: 24 });
  /** @private */_groups = /** @type {string[]} */([]);

  /**
   * @private
   */
  _render() {
    const rowsStructure = getTableStructure(this._cells, this._groups, this._timeRange);

    const rows = rowsStructure.map((r, i) =>
      newEl("tr", {},
        r.map(
          c => !c?.header
            // Normal cell  
            ? (
              newEl(
                i ? "td" : "th",
                c?.span ? { colspan: `${c.span}` } : {},
                c.content
              )
            )
            // Left header
            : (
              newEl(
                i ? "td" : "th",
                { rowspan: `${c?.span || 1}` },
                newEl("div", { class: "program_nazevLinie" },
                  c.content
                )
              )

            )
        ).filter(x => x)
      ));

    const fullTable = newEl("div", { "class": "programNahled_obalProgramu" }, [
      newEl("div", { "class": "programPosuv_obal2" }, [
        newEl("div", { "class": "programPosuv_obal" }, [
          newEl("table", { "class": "program" }, [
            newEl("tbody", { "class": "program" }, rows)
          ])
        ]),
        newEl("div", { "class": "programPosuv_posuv programPosuv_lposuv", style: "display: none;" }, [
          newEl("div")
        ]),
        newEl("div", { "class": "programPosuv_posuv programPosuv_rposuv", style: "display: none;" }, [
          newEl("div")
        ])
      ])
    ]);

    // TODO: don't clear whole container, clear only tbody
    Array.from(this._container.children).forEach(e => this._container.removeChild(e));
    this._container.appendChild(fullTable);
  }

  /**
   * @param {TimeRange} range 
   */
  setTimeRange(range) {
    this._timeRange = range;
    this._render();
  }

  /**
   * @param {string[]} groups 
   */
  setGroups(groups) {
    this._groups = groups;
    this._render();
  }


  /**
   * @param {Cell[]} cells 
   */
  setCells(cells) {
    this._cells = cells;
    cells.filter(x => x.time.from > x.time.to).forEach(c => c.time.to += 24);

    this._render();
  }

  setTime() {

  }

  /**
   * @param {HTMLElement} container 
   */
  constructor(container) {
    /** @private */this._container = container;
    /** @private */this._gridEl = newEl("div", [["style", "display: grid; grid-auto-columns: minmax(0, 1fr); grid-auto-flow: column;"]]);
    this._container.innerHTML = "";
    this._container.appendChild(this._gridEl);

    this.setTimeRange(this._timeRange);
    this.setGroups(this._groups);
  }
}
