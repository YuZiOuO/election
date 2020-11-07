import { state, setState } from "./state";
import { fullDataGrab, partialDataGrab, grabPreData } from "./processSources";
import { buildControls } from "./controls";
import { buildMobileView, buildPreMobileView } from "./buildMobile";
import { buildDesktopView, checkForDesktop, buildPreDesktopView } from "./buildDesktop";
import { checkVariables } from "./utilities";
import SendHeight from "./sender";

const buildNightOf = () => {
  // console.log("--- night of ---");
  // add controls
  buildControls();

  // build destop and mobile depending on current viewport size
  setState("mql", window.matchMedia("(min-width: 720px)"));
  setState("isLive", true);
  state.mql.matches
    ? buildDesktopView()
    : state.mql.addListener(checkForDesktop);
  buildMobileView();

  SendHeight();
}

const buildPre = () => {
  // console.log("--- pre ---");
  
  // grab pre data
  grabPreData();

  // build destop and mobile depending on current viewport size
  setState("mql", window.matchMedia("(min-width: 720px)"));
    state.mql.matches
      ? buildPreDesktopView()
      : state.mql.addListener(checkForDesktop);
  SendHeight();
}

/**
 * determinePageType
 * this function will be passed a string based off of the `pageType` query parameter
 * @param {string} pageType - the page type will be determined by the sting passed
 */
export const determinePageType = (pageType) => {
  setState("year", "2020")
  pageType === "pre" ? buildPre() : buildNightOf(); 
}
