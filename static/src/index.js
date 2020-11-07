/**
 * index
 * Component root
 */
import { state, setState } from "./modules/state";
import { determinePageType } from "./modules/initPage";
import { stateDefinitions } from "./modules/stateDefinitions";
import { determineTier, getQueryVariable } from "./modules/utilities"
import { sourceLocations } from "./modules/sourceLocations"
import { poweredByCheck } from "./modules/poweredBy"
import { toggleLiveData } from "./modules/processSources";

// define app
export const buildComponent = () => {

  // define root
  setState("root", document.getElementById("app"));
  setState("loader", document.getElementById("loader"));
  const wrapper = document.createElement("div");
  wrapper.id = "map";
  setState("map", wrapper);
  state.root.appendChild(state.map);

  // render component
  determinePageType(state.pageType);
};

const setTierAndBuild = res => {
  setState("tier", res ? "stage-" : determineTier(window.location));

  // define asset sources
  setState("locations", sourceLocations(state.tier));

  // render component
  buildComponent();
}

export const index = () => {

  // set legacy
  document.body.setAttribute("class", window.legacyMap ? "isLegacy" : "notLegacy");

  // grab query params
  setState("override", getQueryVariable("mode", window.location.search) === "election_day");
  setState("pageType", getQueryVariable("pageType", window.location.search));
  setState("hasHistorical", getQueryVariable("hasHistorical", window.location.search));
  // state object
  setState("definitions", stateDefinitions);
  window.state = state; // to be removed for production
  window.toggleLiveData = toggleLiveData;

  // check for override
  poweredByCheck(state.override).then(res => {
    setTierAndBuild(res);
  });
};
