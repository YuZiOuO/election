import { toggleMaps, mapReset, checkForSvg, loadYear } from "./events";
import { state } from "./state";

const controlElements = {
  zoom: `<div class="zoom-row">
            <div class="map-toggle">
              <input id="countyToggle" type="checkbox">
              <label for="countyToggle" title="Toggle states and counties">
                <div class="map-toggle__switch" data-checked="Counties" data-unchecked="States"></div>
              </label>
            </div>
        </div>
        <button class="map-reset">Zoom Out</button>`,
  select:`<label for="mapYears" class="select__years--label">
            <select name="mapYears" id="mapYears" class="select__years" aria-label="Choose Year">
              <option value="2020">2020 Live</option>
              <option value="2016">2016</option>
            </select>
          </label>`,
};

/**
 * selectUpdate
 * Will fire off the `loadYear` in context of the selected option
 * @param {event} e 
 */
const selectUpdate = e => {
  e.target.value && loadYear(e.target.value);
};

/**
 * bindControls
 */
const bindControls = () => {
  // zoom
  const toggle = document.querySelector("#countyToggle");
  const reset = document.querySelector(".map-reset");

  toggle.addEventListener("click", (ev => checkForSvg(state.locations.counties, toggleMaps, ev)));
  reset.addEventListener("click", mapReset);

  // bind select
  const select = document.getElementById('mapYears');
  select && select.addEventListener("change", selectUpdate);
};

/**
 * buildControls
 */
export const buildControls = () => {
    const controls = document.getElementById('controls');
    controls.insertAdjacentHTML('beforeend', controlElements.zoom);
    state.hasHistorical ? 
      controls.insertAdjacentHTML('afterbegin', controlElements.select) :
      controls.setAttribute("class", "FTS-page");
    bindControls();
}
