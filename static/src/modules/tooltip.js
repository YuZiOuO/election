import { state, setState } from "./state";
import { processResults, throttle, parseId, formatNumber } from "./utilities";
import { getStatus } from "./processSources";
import { stateDefinitions } from "./stateDefinitions";
import { candidateList } from "./candidates";

/**
 * showTooltip
 * Expeoses the tooltip bases on event values
 * @param {event} e 
 */
export function showTooltip(e) {
  const { clientWidth, clientHeight } = document.body;
  var tooltip = e.target.classList.contains("tooltip")
    ? e.target
    : e.target.querySelector(".tooltip");
  tooltip.style.left =
    e.pageX + tooltip.clientWidth + 10 < clientWidth
      ? e.pageX + 10 + "px"
      : clientWidth + 5 - tooltip.clientWidth + "px";
  tooltip.style.top =
    e.pageY + tooltip.clientHeight + 10 < clientHeight
      ? e.pageY + 10 + "px"
      : clientHeight + 5 - tooltip.clientHeight + "px";
}

/**
 * buildTip
 * Generates the tooltip root and inserts it into the root componenet 
 * @param {element} root 
 */
export const buildTip = (root) => {
  const tip = document.createElement("div");
  tip.id = "tooltip";
  tip.classList.add("tip");
  tip.setAttribute("data-dir", "");
  root.appendChild(tip);
};

/**
 * setDirection
 * Sets the cartesian direction to the `data-dir`
 * @param {object} el - tooltip element
 * @param {object} dir - defines cartesian directions for placement
 */
const setDirection = (el, dir) => {
  const { x, y } = dir;
  el.dataset.dir = `${y}${x}`;
}

/**
 * bindToCursor
 * Binds the tooltip to the cursor as long as it is inside the root component
 * @param {event} ev 
 */
export const bindToCursor = (ev) => {
  const { el } = state.tip;
  const direction = { x: null, y: null };
  el.style.left = `${ev.pageX}px`;
  el.style.top = `${ev.pageY}px`;
  (ev.pageX + el.offsetWidth + 16) > state.root.offsetWidth
    ? direction.x = "w"
    : direction.x = "e";
  ev.pageY + el.offsetHeight > state.root.offsetHeight
    ? direction.y = "n"
    : direction.y = "s";
  setDirection(el, direction);
};

/**
 * tooltipParty
 * Determines which party is the winner of the state the tooltip is hovering over
 * @param {string} name 
 * @param {object} dict 
 */
export const tooltipParty = (name, dict) => {
  // console.log(name, dict);
  let result = "";
  for (let i = 0; i < dict.length; i++) {
    dict[i].candidate == name && (result = dict[i].party);
  }
  return result;
};

/**
 * calledClasses
 * determines which classes are needed for a called state or county
 * @param {object} data - data for selected state
 * @param {string} source - to determin if the contect is state or county
 */
const calledClasses = (data, source) => {
  const newClasses = {
    county: () => `tip tip__polls--closed`,
    state: () => [
      `tip`,
      (data.winner ? (`tip__called--${data.winner.toLowerCase()}`) : ''),
      // data.status === "called" ? `tip__flipped--${data.winner.toLowerCase()}` : '', // come back to this to parse out winner if closed and winner = false
      (data.pollState ? `tip__polls--${data.pollState}` : ''),
  ].join(' ')
  }
  return newClasses[source]();
}

/**
 * pollClass
 * determine class for the open/closed/null status of a state being hovered
 * @param {object} data - data for selected state
 */
const pollClass = data => {
  const { status, pollState } = data;
  return status ? `tip__polls--${pollState}` : "";
}

/**
 * updateTipState
 * Updates the tooltip classes to reflect the state of the tooltip
 * @param {object} data 
 * @param {string} source 
 */
export const updateTipState = (data, source) => {
  const isVisible = state.visible ? ' show' : '';
  state.tip.el.setAttribute("class", ((["null", "initial", "uncalled"].includes(`${data.status}`))) ? 
    `tip ${data.status === "undecided" ? "tip__undecided" : ""} ${pollClass(data)} ${isVisible}` : 
    calledClasses(data, source) + isVisible);
  state.tip.el.setAttribute("data-contested", data.contested);
}

/**
 * lastState
 * Check is the element in `state.last` matches the location the cursor is hovering over
 * @param {object} source - object that contains state.last element  and location string
 */
const lastState = source => {
  const { last, location } = source;
  return last ? stateDefinitions[last].name === location : false;
};

/**
 * updateTip
 * Updated the content of the tooltip if it has chanaged, then sets the result to the application state
 * @param {object} data 
 * @param {function} callback 
 * @param {string} source 
 */
export const updateTip = (data, callback, source) => {
  const stringifed = JSON.stringify(data);
  const isLast = lastState({ last: state.last && state.last.id || null, location: data.location })
  if ((state.current !== stringifed) && !isLast) {
    updateTipState(data, source);
    state.tip.el.innerHTML = callback(data);
  }
  setState("current", stringifed);
}

const statusData = {
  "null": { percent: '—', votes: '—', balance: 'empty', reporting: '', polls: "open"},
  pre: { percent: '—', votes: '—', balance: 'empty', reporting: '', polls: "open"},
  initial: { percent: '0%', votes: '0', balance: 'empty', reporting: 'Reporting 0% in', polls: "close"},
  open: { polls: "close", ofDay: "pm" },
  uncalled: { pollstate: "open", polls: "close" },
  undecided: null,
  off: null,
  called: { },
  closed: { },
}

const activeCandidate = party => {
  return `//a57.foxnews.com/${state.tier}static.foxnews.com/static/orion/styles/img/fox-news/elections/headshots/72/72/${candidateList[state.year][party].img}.png?ve=1&amp;tl=1`
};

/**
 * stateTable
 * The tooltip template for state content
 * @param {object} data 
 */
export const stateTable = (data) => {
  let reporting = `Reporting ${data.reporting}% in`
  data.dem.percent += "%";
  data.rep.percent += "%";
  if (["null", "initial"].includes(data.status)) {
    data.dem.percent = statusData[data.status].percent;
    data.rep.percent = statusData[data.status].percent;
    data.dem.votes = statusData[data.status].votes;
    data.rep.votes = statusData[data.status].votes;
    data.balance = '';
    reporting = statusData[data.status].reporting;
  }
  // if (["uncalled"].includes(data.status)) {
  //   data.reporting = `Reporting ${rng(100, 25)}% in`;
  // }
  return `
  <div class="tip__title">
    <div class="tip__state">${data.location}<span class="tip__flip"></span></div>
    <div class="tip__ev">${data.ev}</div>
  </div> 
  <div class="tip__row">
    <div class="tip__candidate">
    <img src="${activeCandidate("dem")}" class="tip__image tip__image--d" alt="${candidateList[state.year]["dem"].name}" />
      <div class="tip__info">
        <div class="tip__person">${candidateList[state.year]["dem"].name}</div>
        <div class="tip__percent tip__percent--d">${data.dem.percent}</div>
      </div>
    </div>
    <div class="tip__candidate flex-reverse">
      <img src="${activeCandidate("rep")}" class="tip__image tip__image--r" alt="${candidateList[state.year]["rep"].name}" />
      <div class="tip__info">
        <div class="tip__person align-right">${candidateList[state.year]["rep"].name}</div>
        <div class="tip__percent tip__percent--r align-right">${data.rep.percent}</div>
      </div>
    </div>
  </div> 
  <div class="tip__balance">${data.balance}</div>
  <div class="tip__row">
    <div class="tip__votes--d">${formatNumber(data.dem.votes)}</div>
    <div class="tip__votes--r">${formatNumber(data.rep.votes)}</div>
  </div>
  <div class="tip__row tip__polls">
    <div class="tip__time ${state.isLive ? "" : "opacity-zero"}">${data.polls}</div>
    <div class="tip__reporting">${reporting}</div>
  </div>
  `;
};

/**
 * countyTable
 * The tooltip template for county content
 * @param {object} data 
 */
export const countyTable = (data) => {
  // console.log("county data:", data);
  const candidateTemplate = (candidate) => {
    candidate.percent += "%";
    if (["null", "initial"].includes(data.status)) {
      candidate.votes = statusData[data.status].votes;
      candidate.percent = statusData[data.status].percent;
    }
    return `
    <div class="tip__row">
      <div class="tip__name" data-party="${candidate.party}">${candidate.name}</div>
      <div class="tip__votes">${formatNumber(candidate.votes)}</div>
      <div class="tip__pcnt">${candidate.percent}</div>
    </div>
    `;
  }
  let reporting = (["null", "initial"].includes(data.status)) ? statusData[data.status].reporting : `Reporting ${data.reporting}% in`;
  const resultsString = `
  <div class="tip__title">
    <div class="tip__state">${data.location}</div>
  </div>
  ${data.candidates.map(can => candidateTemplate(can)).join('')}
  <div class="tip__row tip__polls">
    <div class="tip__time county"></div>
    <div class="tip__reporting">${reporting}</div>
  </div>
  `;
  return resultsString;
};


/**
 * buildBalance
 * Create the balance bar surfaced in the state tooltip
 * @param {object} data 
 */
export const buildBalance = (data) => {
  const votes = { 'd': 0,'i': 0, 'g': 0, 'o': 0, 'r': 0 }
  data.forEach(candidate => {
    let key = candidate.party.toLowerCase();
    Object.keys(votes).indexOf(key) > -1 ? votes[key] += parseFloat(candidate.percent) : votes.o += parseFloat(candidate.percent);
  });
  return Object.keys(votes).reduce((acc, curr) => acc += votes[curr] > 0 ? `<div class="tip__balance--${curr}" style="width: ${votes[curr].toFixed(1)}%"></div>` : '', '');
}

const buildCandidateList = results => {
  return results.map(res => {
    const name = processResults(res.candidateNpid, "candidates", "npid");
    return {
      party: tooltipParty(name.lastName, state.dict) || name.partyCode,
      name: name,
      count: res.votes.count,
      percent: res.votes.percentage.toFixed(1),
      win: res.isWinner
   };
  });
};

const buildCandidate = (list, party) => {
  const candidate = list.find((obj) => ( obj.party || obj.name.partyCode) === party);
  return {
    party: candidate.party,
    name: `${candidate.name.firstName} ${candidate.name.lastName}`,
    votes: candidate.count,
    percent: candidate.percent,
  }
}

/**
 * stateData
 * Constructs the data object used to build out the state content
 * @param {event} ev 
 */
export const stateData = (ev) => {
  if (!state.json || !state.dict) {
    return;
  }
  const { results, stateCode, expectedPercentage } = processResults(
    parseId(ev.target).toUpperCase(),
    "stateResults",
    "stateCode"
  );
  if (!results) {
    return;
  }
  const candidates = buildCandidateList(results);
  const st = stateCode.toLowerCase();
  const winner = candidates.find((obj) => obj.win);
  const tableData = {
    location: state.definitions[st].name,
    ev: `${state.definitions[st].ev} votes`,
    dem: buildCandidate(candidates, "D"),
    rep: buildCandidate(candidates, "R"),
    polls: state.definitions[st].pollString,
    pollState: `${state.definitions[st].pollStatus}`,
    winner: winner ? winner.party : false,
    balance: buildBalance(candidates),
    flipped: null,
    status: `${state.definitions[st].status}`,
    reporting: expectedPercentage,
    contested: state.definitions[st].contested
  };
  state.tip.target = ev.target;
  (state.cover || ev.target.id.length > 2 || ev.target.id === "ak") && updateTip(tableData, stateTable, "state");
};

/**
 * calculatePercent
 * Calculate the vote percentage bassed off of votes and total votes provided from county data
 * @param {number} total 
 * @param {number} votes 
 */
export const calculatePercent = (total, votes) => {
  return ((votes / total) * 100).toFixed(1);
};

/**
 * backFillCountyCandidates
 * insert candidates that did not meet the threshold to ensure there are at least 2 candidates in data set
 * @param {object} results - results container
 * @param {array} results.finalResults - computed results above 10% threshold
 * @param {object} results.improvedResults - processed results from county results data
 */
const backFillCountyCandidates = ({ finalResults, improvedResults }) => {
  const backFillObj = {
    0: [
      {name: "Trump", votes: 0, percent: "0", party: "R"},
      {name: "Biden", votes: 0, percent: "0", party: "D"}
    ],
    1: [...finalResults, improvedResults[1]]
  }
  const backfilled = finalResults.length < 2 ? backFillObj[finalResults.length] : finalResults;
  return backfilled;
}

/**
 * countyCandidateSet
 * Processes county results to match candidate name to its election data.
 * Will return at least the highest two ranking candidates
 * @param {Object} obj - root object
 * @param {Array} obj.results - county results
 * @param {Array} obj.parties - array of party symbols 
 * @param {Number} obj.totalVotes - number of total votes for the county
 */
const countyCandidateSet = ({ results, parties, totalVotes }) => {
  const improvedResults = results.map(candidate => {
    const party = tooltipParty(candidate.name, state.dict);
    candidate.percent = calculatePercent(totalVotes, candidate.votes);
    candidate.party = parties.indexOf(party.toLowerCase()) > -1 ? party : 'O';
    return candidate;
  });
  const finalResults = improvedResults.filter(candidate => parseInt(candidate.percent) >= 10);
  const dataSet = backFillCountyCandidates({ finalResults, improvedResults });
  return dataSet;
}

/**
 * buildCountyCandidate
 * Constructs the data object used to build out the county content
 * @param {object} results 
 */
export const buildCountyCandidate = (results) => {
  const parties =  ['d','i','g','o','r'];
  const totalVotes = results.reduce((acc, val) => acc + val.votes, 0);
  const finalResults = countyCandidateSet({ results, parties, totalVotes });
  return finalResults.map(candidate => (
    {
      party: candidate.party,
      name: candidate.name,
      votes: candidate.votes,
      percent: candidate.percent,
    }
  ));
}

/**
 * countyData
 * Extracts the county data based off of the county the tooltip is currently hovering over
 * @param {event} ev 
 */
export const countyData = (ev) => {
  const countyResults = state.csv[ev.target.getAttribute("data-index")];
  const sortedResults = sortedCounty(countyResults);
  const id = ev.target.getAttribute("data-name").split(" ")[1];
  const st =  ev.target.getAttribute("data-state");
  const status = ev.target.getAttribute("data-status");
  const tableData = {
    location: state.nameMap[ev.target.id],
    candidates: buildCountyCandidate(sortedResults),
    polls: state.definitions[st].pollString,
    status: `${status}`,
    state: st,
    reporting: countyResults[1]
  }
  state.tip.target = ev.target;
  updateTip(tableData, countyTable, "county");
};


/**
 * sortedCounty
 * Sorts the election results for provided county in descending order
 * @param {object} countyResults 
 */
export const sortedCounty = (countyResults) => {
  let hydratedResults = [];
  const candidates = countyResults.slice(2);
  candidates.forEach((v, i, a) => {
    ((i % 2 < 1) && state.dict[v] !== undefined) &&
      hydratedResults.push({ name: state.dict[v].candidate, votes: a[i + 1] });
  });
  return hydratedResults.sort((a, b) => b.votes - a.votes);
};

/**
 * toggleHover
 * Toggles the hover state for the corresponding state path
 * @param {string} id - state id 
 * @param {boolean} toggle - boolen to determin hover state
 */
const toggleHover = (id, toggle) => {
  if (!id.includes("FIPS")) {
    const el = state.nation.querySelector(`#${id}`);
    el && el.setAttribute("data-hover", toggle);
  }
};

/**
 * tooltipEnter
 * Updates the visual and application state when the tooltip hovers over a relevant element
 * @param {event} ev 
 */
export const tooltipEnter = (ev) => {
  state.tip.el.classList.add("show");
  setState("visible", true);
  ev.target.dataset.name && toggleHover(ev.target.dataset.name, true);
};

/**
 * tooltipExit
 * Updates the visual and application state when the tooltip hovers over a relevent element
 * @param {event} ev 
 */
export const tooltipExit = (ev) => {
  state.tip.el.classList.remove("show");
  setState("visible", false);
  ev.target.dataset.name && toggleHover(ev.target.dataset.name, false);
};

const bindText = textgroup => {
  const textEls = [...textgroup.querySelectorAll('path')];
  textEls.forEach(el => {
    el.addEventListener("mouseenter", tooltipEnter);
    el.addEventListener("mouseleave", tooltipExit);
  });
}

/**
 * throttleState/throttleCounty
 * Sets the throttle values for the tooltip updates
 */
export const throttleState = throttle(100, stateData);
export const throttleCounty = throttle(100, countyData);

/**
 * bindToolTip
 * Binds event listeners to state elements to update the tooltip
 * @param {element} nation 
 * @param {element} electoralText 
 * @param {element} smallStates 
 */
export const bindToolTip = (nation, electoralText, smallStates) => {
  nation.addEventListener("mouseenter", tooltipEnter, false);
  nation.addEventListener("mouseleave", tooltipExit, false);
  nation.addEventListener("mousemove", throttleState, false);
  smallStates.addEventListener("mouseenter", tooltipEnter, false);
  smallStates.addEventListener("mouseleave", tooltipExit, false);
  smallStates.addEventListener("mousemove", throttleState, false);
  bindText(electoralText);
};

/**
 * bindCountyListeners
 * Binds event listeners to county elements to update the tooltip
 * @param {element} counties 
 */
export const bindCountyListeners = (counties) => {
  counties.addEventListener("mouseenter", tooltipEnter, false);
  counties.addEventListener("mouseleave", tooltipExit, false);
  counties.addEventListener("mousemove", throttleCounty, false);
};

/**
 * initTooltip
 * Fires off the funtions to create, place and bind the tooltop
 * @param {element} root 
 */
export const initTooltip = (root) => {
  buildTip(root);
  setState("tip", { el: document.getElementById("tooltip"), target: null });
  root.addEventListener("mousemove", bindToCursor, false);
  bindToolTip(state.nation, state.electoralText, state.smallStates);
};
