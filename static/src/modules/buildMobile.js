/**
 * buildMobile
 * Build out the mobile state map according based of of state data
 */
import { buildNode } from "./buildNode";
import { state, setState } from "./state";
import { checkSendHeight } from "./utilities";
import { displayLoader } from "./events";
import { initialDataGrab } from "./processSources";

/**
 * stateTemplate
 * return an anchor element based off the provided state abbeviation
 * @param {string} st
 * @returns {object}
 */
const stateTemplate = (st) => {
  return {
    type: "a",
    classes: ["mobile-state", `m-${st.toLowerCase()}`],
    attr: [
      {
        name: "href",
        value: `/elections/2020/general-results/state/${state.definitions[
          st
        ].name.toLowerCase()}`,
      },
    ],
    innerHTML: `<div class="mobile-state__data">
        <div class="mobile-state__name">${st.toUpperCase()}</div>
        <div class="mobile-state__ev">${state.definitions[st].ev}</div>
      </div>`,
  };
};

/**
 * districtTemplate
 * return a div element based off the provided district abbeviation
 * @param {string} st
 * @returns {object}
 */
const districtTemplate = st => {
  return {
    parent: `m-${st.split("-")[1]}`,
    el: buildNode({
      type: "div",
      classes: ["mobile-district", `${st}`],
      innerHTML: `<div class="mobile-district__circle"></div>`
    })
  }
};

/**
 * appendDistrict
 * this will append an element defined by the `districtTemplate` via  the `districtMap`
 * @param {object} dist - district object
 * @param {element} root - the mobile grid element
 */
const appendDistrict = (dist, root) => {
  const parent = root.querySelector(`.${dist.parent}`);
  parent.appendChild(dist.el);
}

/**
 * generateMaps
 * parses out states from districts and return them as two separate arrays
 * @param {objec} defs - state data definitions
 */
const generateMaps = defs => {
  const districtMap = [];
  const mobileMap = Object.keys(defs).reduce((acc, st) => {
    (st.length === 2) ? acc.push(buildNode(stateTemplate(st))) : districtMap.push(districtTemplate(st));
    return acc;
  }, []);
  return {
    districtMap,
    mobileMap
  }
}

/**
 * buildMobileView
 */
export const buildMobileView = () => {
  setState("mobile", document.getElementById("mobile"));
  const mobileGrid = buildNode({ type: "div", classes: ["state-grid"] });
  const { mobileMap, districtMap } = generateMaps(state.definitions);
  mobileMap.forEach((el) => mobileGrid.appendChild(el));
  districtMap.forEach(dist => appendDistrict(dist, mobileGrid));
  state.mobile.appendChild(mobileGrid);

  // grab data to populate if mobile view is displayed first
  !state.mql.matches && initialDataGrab(state.polls);
  checkSendHeight();
};

export const buildPreMobileView = data => {
  buildMobileView();
  Object.keys(data).forEach(st => {
    // console.table({ state: st, party: data[st] });
    const stateObject = {
      stateCode: st,
      party: data[st] ? data[st].toLowerCase() : ""
    }
    populateMobile(stateObject);
  });
  displayLoader(false);
  checkSendHeight()
};

/**
 * singleState
 * add a class to the mobile state element to determine its color
 * @param {object} st - data used to determine the state color
 */
const singleState = (st, party) => {
  return {
    el: document.querySelector(`.m-${st.stateCode.toLowerCase()}`),
    class: `mobile-state--${party}`
  }
}

/**
 * splitState
 * add a class to the mobile state element
 * @param {object} st - data used to determine the state color
 */
const splitState = (st, party) => {
  return {
    el: document.querySelector(`.${st.stateCode}`),
    class: `mobile-district--${party}`
  }
}

const liveParty = stateCode => {
  return state.definitions[stateCode].contested ? "C" : `${state.definitions[stateCode].party}`;
}

const historicalParty = stateCode => {
  return `${state.definitions[stateCode].party}`;
};

const grabParty = stateCode => {
  const party = state.isLive ? liveParty(stateCode) : historicalParty(stateCode);
  return state.pageType === "pre" ?  `${state.preData[stateCode]}` : party.toUpperCase();
}

const clearMobileStatus = el => {
  const classes = el.getAttribute("class");
  const baseClasses = classes.split(" ").slice(0,2).join(" ");
  el.setAttribute("class", baseClasses);
};

/**
 * populateMobile
 * populates the current color to the state
 * @param {object} st - data used to determine state elelement and color
 */
export const populateMobile = (st) => {
  // console.table({st});
  const party = grabParty(st.stateCode.toLowerCase() || st).toLowerCase();
  const selector = st.stateCode.length === 2 ? singleState(st, party) : splitState(st, party);
  // console.log(selector)
  const status = state.pageType === "pre" ? "pre" : state.definitions[st.stateCode.toLowerCase()].status;
  // console.log("mobile status:",status, st.stateCode);
  clearMobileStatus(selector.el);
  if (status) {
    selector.el.classList.add(selector.class);
    selector.el.classList.add(status);
  }
}
