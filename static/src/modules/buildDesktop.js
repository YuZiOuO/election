/**
 * buildDesktop
 * Build out the desktop state map according based of of state data
 */

import { grabSvg } from "./grabSvg";
import { state, initialDesktopState, setState } from "./state";
import { bindObject, displayLoader } from "./events";
import { initTooltip } from "./tooltip";
import { checkSendHeight, checkElement } from "./utilities";
import { initialDataGrab } from "./processSources";
import { fillGrad } from "./gradient";

const bindGradients = map => {
  setState("gradme", map.querySelector("#grad-me"));
  setState("gradne", map.querySelector("#grad-ne"));
};

/**
 * buildDesktopView
 */
export const buildDesktopView = () => {
  displayLoader(true);
  grabSvg(state.locations.states).then((svg) => {
    displayLoader(false);
    state.map.appendChild(svg);
    setState("desktop", true);
    return svg;
  }).then((svg) => {
    bindGradients(state.map);
    initialDesktopState();
    bindObject(svg);
    initTooltip(state.root);

    // grab data to populate if desktop view is displayed first
    state.mql.matches && initialDataGrab(state.polls);
    checkSendHeight();
  });
};

export const populatePreData = data => {
  Object.keys(data).forEach(st => {
    const stateObject = {
      stateCode: st,
      party: data[st]
    }
    populateDesktop(stateObject);
  });
};

export const buildPreDesktopView = resize => {
  displayLoader(true);
  grabSvg(state.locations.states).then((svg) => {
    displayLoader(false);
    state.map.appendChild(svg);
    bindGradients(state.map);
    initialDesktopState();
    (resize || state.preData)  && populatePreData(state.preData);
    setState("desktop", true);
  });
  checkSendHeight();
}

/**
 * checkForDesktop
 * @param {event} ev
 */
export const checkForDesktop = (ev) => {
  const type = state.pageType === "pre" ? buildPreDesktopView : buildDesktopView
  ev.matches && !state.desktop && type(true);
};

/**
 * checkStatus
 * returns the poll status for the state from `state.defintions`
 * @param {object} st - object containing state data
 */
const checkStatus = st => {
  const thisState = st.stateCode.toLowerCase()
  return state.definitions[thisState] && state.definitions[thisState].status ? state.definitions[thisState].status : null;
};

/**
 * setTextColor
 * set the color of the text based on a convoluted set of logic
 * @param {element} textEl - the text element
 * @param {string} party - faored party
 * @param {string} status - the electoral state
 */
const setTextColor = (textEl, party, status, id) => {
  const gradException = (status === "pre" && (party === "D" || party === "R"));	  
  (textEl && (status || gradException)) &&  textEl.setAttribute("data-party", party);	
  (textEl && (status || gradException)) &&  textEl.setAttribute("data-status", status);
}

/**
 * fillState
 * inserts values into state and text elements
 * @param {element} stateEl - primary state element
 * @param {element} textEl - test element
 * @param {string} party - party value
 */
const fillState = (stateEl, textEl, party, status) => {
  stateEl && stateEl.setAttribute("data-party", party);
  stateEl && stateEl.setAttribute("data-status", status);
  stateEl && setTextColor(textEl, party, status, stateEl.id);

};

/**
 * singleState
 * add a class to the mobile state element to determine its color
 * @param {object} st - data used to determine the state color
 */
const singleState =(id, party, status) => {

  // populate state data
  const stateEl = document.getElementById(id);
  const textEl = document.querySelector(`[data-name="${id}"]`);
  const smallEl = document.querySelector(`[id*="bubble-${id}"]`);
  const nullStatusForParty = status === "null" ? "" : party;
  fillState(stateEl, textEl, nullStatusForParty, status);
  smallEl && smallEl.setAttribute("data-party", nullStatusForParty);
  smallEl && smallEl.setAttribute("data-status", status);
}

const splitDistrict = (id, party, status) => {
  const atlarge =  id.split("-")[1];
  const district = id.split("-")[2];
  const districtEl = document.getElementById(id);
  districtEl && districtEl.setAttribute("data-party", party);
  districtEl && districtEl.setAttribute("data-status", status);
  fillGrad(atlarge, district, `${party}-${status}`);
  state.map.setAttribute(`data-${atlarge}-${district}`, status);
}

const splitAtLarge = (id, party, status) => {
  const stateEl = document.getElementById(id);
  const textEl = document.querySelector(`[data-name="${id}"]`);
  const atLargeEl = document.getElementById(`overall-${id}-bg`);
  fillState(stateEl, textEl, party, status);
  atLargeEl && atLargeEl.setAttribute("data-party", party);
  atLargeEl && atLargeEl.setAttribute("data-status", status);
  fillGrad(id, 'large', `${party}-${status}`);
  state.map.setAttribute(`data-${id}-large`, status);
}

/**
 * splitState
 * add a class to the mobile state element
 * @param {object} st - data used to determine the state color
 */
const splitState = (id, party, status) => {
  // console.table({id, party, status});
  id.length > 2 ? splitDistrict(id, party, status) : splitAtLarge(id, party, status);
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
};

/**
 * populateDesktop
 * @param {object} st
 */
export const populateDesktop = (st) => {
  const stateRoot = st.stateCode.toLowerCase().split("-");
  const party = grabParty(st.stateCode.toLowerCase() || st);
  const status = state.pageType === "pre" ? "pre" : checkStatus(st);
  // console.log(stateRoot, status);
  (stateRoot.includes("ne") || stateRoot.includes("me")) ?
    splitState(st.stateCode.toLowerCase(), party, status) : 
    singleState(st.stateCode.toLowerCase(), party, status);
};
