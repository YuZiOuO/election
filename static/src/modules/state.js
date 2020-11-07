export const state = {
  root: null,
  nation: null,
  display: null,
  viewbox: null,
  last: null,
  cover: true,
  current: null,
  desktop: false,
  override: null,
  live: null,
  isLive: null,
  touchFlag: "",
  visible: false
};

/**
 * setState
 * @param {string} key 
 * @param {*} val 
 */
export const setState = (key, val) => {
  return (state[key] = val);
};

/**
 * getState
 * @param {string} key 
 */
export const getState = (key) => {
  return state[key];
};

/**
 * initialDesktopState
 */
export const initialDesktopState = () => {
  setState("viewbox", document.querySelector("#map > svg"));
  setState("nation", document.getElementById("state-shapes"));
  setState("origin", "0 0 872 537");
  setState("controls", document.getElementById("controls"));
  state.viewbox.setAttribute("viewBox", state.origin);
  state.viewbox.querySelector("title").innerHTML = "";
  
};
