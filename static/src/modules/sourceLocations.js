import { getQueryVariable } from "./utilities"
import { state } from "./state";

export const sourceLocations = tier => {
  const getPlan = getQueryVariable("tier", window.location.search) === "zero" ? "0" : state.plan; // for testing
  const timestamp = new Date().getTime();
  return {
    states: "svg/map-states-electoral.svg",
    counties: "svg/map-counties-electoral.svg",
    pre: `https://${state.adminTier}feeds-elections.foxnews.com/archive/politics/elections/2020/1/admin-general.json`,
    polls: `https://${state.adminTier}feeds-elections.foxnews.com/archive/politics/elections/2020/1/admin-general.json`,
    csv: `https://${tier}feeds-elections.foxnews.com/archive/politics/elections/2020/${getPlan}/President/county-level-results/feed_slimmer.csv`,
    json: `https://${tier}feeds-elections.foxnews.com/archive/politics/elections/2020/${getPlan}/2020_Generals/President/national_summary_results/file.json`,
    names: `https://${tier}feeds-elections.foxnews.com/archive/politics/elections/2020/${getPlan}/President/county-level-results/county_fips.csv`,
  }
};

export const sourceByYear = year => {
  return {
    json: `https://${state.tier}feeds-elections.foxnews.com/archive/politics/elections/${year}/3/${year}_Generals/President/national_summary_results/file.json`,
    csv: `https://${state.tier}feeds-elections.foxnews.com/archive/politics/elections/${year}/3/President/county-level-results/feed_slimmer.csv`
  }
}

export const timestampSource = url => {
  const timestamp = new Date().getTime();
  return `${url}?cb=${timestamp}`;
}