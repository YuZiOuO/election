import { state, getState, setState } from "./state";
import { parseId, throttle } from "./utilities";
import { grabSvg } from "./grabSvg";
import { bindCountyData, fullDataGrab, historicalDataGrab } from "./processSources";
import { bindCountyListeners, tooltipEnter } from "./tooltip";
import { sourceByYear } from "./sourceLocations"

/**
 * clickToggle
 * Fires off methods connected to state/county click event to zoom or pan the map
 * @param {event} ev 
 */
export const clickToggle = ev => {
  ev.preventDefault();
  let targetId, targetEl;
  if (ev.target.parentNode.id.indexOf("-counties") > -1) {
    targetId = ev.target.dataset.state;
    targetEl = document.getElementById(targetId);
  } else  {
    targetId = parseId(ev.target);
    targetEl = document.getElementById(targetId);
  }
  zoomState(targetId);
  toggleState(targetEl);
};

/**
 * checkForSvg
 * This method checks if the counties svg has been loaded on the page.
 * If true, then callback will be fired
 * If false, the counties SVG will be fetched, and then the callback will be fired
 * @param {string} location 
 * @param {function} callback 
 * @param {event} event 
 */
export const checkForSvg = (location, callback, event) => {
  if (state.counties) {
    // console.log("should have svg");
    callback(event);
  } else {
    displayLoader(true);
    // console.log("grabSVG");
    grabSvg(location)
      .then((svg) => {
        // console.log("grabbed");
        const counties = svg.getElementById("counties-shapes");
        state.viewbox.insertBefore(counties, state.nation.parentNode);
        setState(setState("counties", counties));
        bindCountyData(state.csv);
        bindCountyListeners(state.counties);
        bindCountyClick(state.counties);
      })
      .then(() => {
        displayLoader(false);
        callback(event);
      });
  }
};

/**
 * toggleState
 * This will hide or show the relevent state in the SVG as needed
 * @param {element} el 
 */
export const toggleState = el => {
  if (el.id == "ak") {
    return;
  }
  const last = getState("last");
  last && (last.style.fill = "");
  el.style.fill = "none"
  setState("last", el);
};

/**
 * toggleMaps
 * This will hide or show the state in the SVG
 */
export const toggleMaps = () => {
  state.map.classList.toggle("empty"); 
  setState("cover", !state.cover);
}

export const displayLoader = bool => {
  state.loader.setAttribute("class", bool ? "" : "hide");
}

/**
 * setView
 * This will update the viewbox value to the the desired destination and start the SVG animation
 * @param {string} view 
 */
export const setView = (view) => {
  // state.viewbox.setAttribute("viewBox", view);
  // console.log("view:", view)
  const current = state.animation.getAttribute("values").split(';')[1];
  const destination = `${current}; ${view}`
  state.animation.setAttribute("values", destination);
  if (typeof state.animation.beginElement === "undefined") {
    console.log("does not support beginElement()");
    // state.viewbox.setAttribute("viewBox", view);
  } else {
    state.animation.beginElement();
  }
}

/**
 * zoomState
 * Sets the 'zoom' class to the state that is passed to it
 * @param {string} id 
 */
export const zoomState = id => {
  setView(state.definitions[id].pos);
  state.viewbox.classList.add('zoom');
  state.controls.classList.add('zoom');
  !state.touchFlag.includes("FIPS") && state.tip.el.classList.remove("show");
};

/**
 * zoomReset
 * Removes the 'zoom' class and sets the viewbox to its original value
 * @param {event} ev 
 */
export const zoomReset = ev => {
  ev.preventDefault();
  setView(state.origin);
  state.viewbox.classList.remove('zoom');
  state.controls.classList.remove('zoom');
  setState("touchFlag", "");
};

/**
 * mapReset
 * Reverts the updates set to zoom in on a particular state
 * @param {event} ev 
 */
export const mapReset = (ev) => {
  ev.preventDefault();
  const last = getState("last");
  last && (last.style.fill = "");
  setState("last", null);
  zoomReset(ev);
}

/**
 * addAnimationElement
 * Generates the SVG animation element and inserst it into the root of the SVG
 */
export const addAnimationElement = () => {
  const xmlns = "http://www.w3.org/2000/svg";
  const aniElement = document.createElementNS(xmlns, "animate");
  aniElement.setAttributeNS(null, "id", "ani");
  aniElement.setAttributeNS(null, "attributeName", "viewBox");
  aniElement.setAttributeNS(null, "values", `${state.origin}; ${state.origin}`);
  aniElement.setAttributeNS(null, "dur", "0.2s");
  aniElement.setAttributeNS(null, "fill", "freeze");
  state.viewbox.appendChild(aniElement);
  setState("animation", aniElement);
}

const eventHandlerState = ev => {
  state.tip.el.setAttribute("data-pointer", ev.pointerType);
  ev.pointerType === "touch" && tooltipEnter(ev)
  if (ev.pointerType === "mouse" || ev.target.id === state.touchFlag) checkForSvg(state.locations.counties, clickToggle, ev)
  setState("touchFlag",  ev.target.id);
}

const eventHandlerCounty = ev => {
  state.tip.el.setAttribute("data-pointer", ev.pointerType);
  ev.pointerType === "touch" && tooltipEnter(ev);
  if (ev.pointerType === "mouse" || ev.target.id === state.touchFlag) clickToggle(ev)
  setState("touchFlag",  ev.target.id);
}

/**
 * bindCountyClick
 * Binds event listenters to the county element
 * @param {element} counties - the svg element containing the county paths
 */
const bindCountyClick = (counties) => {
  counties.onpointerdown = eventHandlerCounty;
  
}

/**
 * bindObject
 * Sets the references for the states on the map to the application state.
 * It then adds event listeners to the map states.
 * @param {*} el 
 */
export const bindObject = el => {
  const states = el.getElementById('state-shapes');
  const smallStates = el.getElementById('small-states-2');
  setState("electoralText", el.getElementById('electoral-votes'));
  setState("smallStates", el.getElementById('small-states-2'));
  addAnimationElement();
  states.onpointerdown = eventHandlerState;
  smallStates.onpointerdown = eventHandlerState;
};

const livePull = () => {
  fullDataGrab();
  state.root.setAttribute("data-live", "true");
  toggleLiveData(true)
}

const historicalPull = year => {
  state.root.setAttribute("data-live", "false");
  setState("historicalSource", sourceByYear(year));
  historicalDataGrab(state.historicalSource)
  toggleLiveData(false);
}

export const loadYear = year => {
  const isLive = year === "2020";
  setState("year", year);
  isLive ? livePull() : historicalPull(year);
}

