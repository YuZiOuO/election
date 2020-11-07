import { state, setState } from "./state";

/**
 * grabSvg
 * Fetch SVG file then parse and retrun to invoking script
 * @param {string} svgLocation 
 */
export const grabSvg = (svgLocation) => {
  return fetch(svgLocation)
    .then((resp) => resp.text())
    .then((data) => {
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(data, "text/xml");
      return xmlDoc.querySelector("svg");
    });
};
