/**
 * @template T
 * @param {T | T[]} arrLike
 * @returns {T[]}
 */
export const asArray = (arrLike) =>{
  return Array.isArray(arrLike)
    ? arrLike
    : [arrLike];
};

/**
 * @param {keyof HTMLElementTagNameMap} type
 * @param {[string, string][]} [attributes]
 * @param {string | Node | Node[]} [children]
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
