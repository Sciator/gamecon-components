/**
 * @template T
 * @param {T | T[]} arrLike
 * @returns {T[]}
 */
export const asArray = (arrLike) => {
  return Array.isArray(arrLike)
    ? arrLike
    : [arrLike];
};

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} type
 * @param {[string, string][]} [attributes]
 * @param {string | Node | Node[]} [children]
 * @returns {HTMLElementTagNameMap[T]}
 */
export const newEl = (type, attributes = [], children = []) => {
  const element = document.createElement(type);
  attributes.forEach(([key, value]) => element.setAttribute(key, value));

  if (typeof children == "string") {
    element.innerText = children;
  } else {
    asArray(children).forEach(el => element.appendChild(el));
  }
  return element;
};

/**
 * @type {{
 *   (...args: [max: number] | [min: number, max: number, step?: number]): number[];
 * }}
*/
// @ts-ignore
export const range = (n, n1, step = 1) =>
  Array.from(
    Array(
      (n1 === undefined)
        ? n
        : Math.max(Math.ceil((n1 - n) / step), 0)
    ).keys())
    .map((n1 === undefined) ? (x => x) : (x => (x * step + n)))
  ;

/**
 * Returns unique values only 
 */
export const distinct = /** @type {{ (input: number[]) : number[]; (input: string[]) : string[]; }} */((arr) =>
  Array.from(new Set(/** @type {any} */(arr))));

/**
 * @template T, T1
 * @param {T[]} arr
 * @param {T1[]} arr1
 * @returns {[T, T1][]}
 */
export const zip = (arr, arr1) =>{
  const len = Math.max(arr.length, arr1.length);
  /** @type {[T, T1][]} */
  const newArr = Array(len);
  for (let i = len;i--;) {
    newArr[i] = [arr[i], arr1[i]];
  }
  return newArr;
};
