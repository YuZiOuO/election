// gradient.js

import { state } from "./state"
import { checkElement } from "./utilities";

const colors = {
  // dem
  "D": "dem",
  "D-pre": "dem",
  "D-called": "dem",
  "D-uncalled": "dem-lean",
  "LD": "dem-lean",
  "LD-pre": "dem-lean",
  
  // rep
  "R": "rep",
  "R-pre": "rep",
  "R-called": "rep",
  "R-uncalled": "rep-lean",
  "LR": "rep-lean",
  "LR-pre": "rep-lean",

  // ind
  "I": "ind",
  "I-pre": "ind",
  "I-called": "ind",
  "I-uncalled": "ind-lean",
  "LI": "ind-lean",
  "LI-pre": "ind-lean",

  // green
  "G": "green",
  "G-pre": "green",
  "G-called": "green",
  "G-uncalled": "green-lean",
  "LG": "green-lean",
  "LG-pre": "green-lean",

  // other
  "O": "other",
  "O-pre": "other",
  "O-called": "other",
  "O-uncalled": "other-lean",
  "LO": "other-lean",
  "LO-pre": "other-lean",

  // battle/conested
  "B": "battle",
  "B-pre": "battle",
  "C-called": "battle",
  "C-uncalled": "battle",

  // empty
  "pre": "#fff",
  "null": "#fff",
  "-null": "#fff",
  "null-null": "#fff",
};

const gradIndexes = {
  "me": {
    "large": [0,1,6,7],
    "01": [2,3,8,9],
    "02": [4,5,10,11]
  },
  "ne": {
    "large": [0,1,8,9,16,17],
    "01": [2,3,10,11,18,19],
    "02": [4,5,12,13,20,21],
    "03": [6,7,14,15,22,23]
  }
};

export const fillGrad = (elId, district, value) => {
  checkElement(`#grad-${elId}`)
    .then(() => { 
      gradIndexes[elId][district].forEach(i => {
        state[`grad${elId}`].children[i].setAttribute("class", colors[value]);
      });
    });
}