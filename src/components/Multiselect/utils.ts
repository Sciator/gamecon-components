export const asArray = <T>(arrLike: T | T[]): T[] =>{
  return Array.isArray(arrLike)
    ? arrLike
    : [arrLike];
};

export const newEl = (type: keyof HTMLElementTagNameMap, attributes: [string, string][] = [], children: string | Node | Node[] = []) => {
  const element = document.createElement(type);
  attributes.forEach(([key, value]) => element.setAttribute(key, value));

  if (typeof children == "string") {
    element.innerText = children;
  } else {
    asArray(children).forEach(el => element.appendChild(el));
  }
  return element;
};
