import { state, setState, getState } from "./state";
import { checkParty, padStart, sortForWinner, buildCandidateList, logging } from "./utilities";
import { populateDesktop, populatePreData } from "./buildDesktop";
import { populateMobile, buildPreMobileView } from "./buildMobile";
import { displayLoader } from "./events";
import { stateDefinitions } from "./stateDefinitions";
import { stateData } from "./tooltip";
import { timestampSource } from "./sourceLocations";

const mapColors = {
  "leaningDem": "LD",
  "rep": "R", 
  "dem": "D",
  "green": "G",
  "battleground": "B",
  "leaningRep": "LR",
  "default": "",
  "other": "O",
  "ind": "I",
  "contested": "C"
}

/**
 * convertCSVToArrayOfArrays
 * Consumes an object containing CSV and options.
 * Returns a data model in form of an array of arrays
 * @param {object} data
 * @param {object} param1
 * @returns {array}
 */
const convertCSVToArrayOfArrays = (data, { header, separator }) => {
  const csv = data;
  const array = [];
  const rows = csv.split(/(?!\B"[^"]*)\n(?![^"]*"\B)/g);

  rows.forEach((row, idx) => {
    const values = row.split(separator);
    const checkedAndConvertedValues = [];
    if (rows.length - 1 !== idx && ((!header && idx !== 0) || header)) {
      values.forEach((value) => {
        const convertedToNumber = convertStringToNumber(value);
        const thisValue = Number.isNaN(convertedToNumber)
          ? value
          : convertedToNumber;

        checkedAndConvertedValues.push(thisValue);
      });

      array.push(checkedAndConvertedValues);
    }
  });
  return array;
};

/**
 * convertCSVToArray
 * Ingests CSV, defines options and checks if data is valibe before processing
 * @param {object} data
 * @param {object} param1
 * @returns {object}
 */
const convertCSVToArray = (data, { header, type, separator } = {}) => {
  const thisOptions = {
    header: header !== false,
    type: type || "array",
    separator: separator || ",",
  };
  checkIfValid(data, thisOptions);
  return convertCSVToArrayOfArrays(data, thisOptions);
};

/**
 * convertStringToNumber
 * Takes a string then verifies it before converting it into a number
 * @param {string} value
 * @returns {float}
 */
const convertStringToNumber = (value) => {
  if (typeof value !== "string") {
    throw new Error(
      `value has to be typeof: 'string' but got typeof: '${typeof value}'`
    );
  }
  if (Number.isNaN(Number(value))) {
    // if not a number
    return NaN;
  }
  const float = parseFloat(value);
  // check if integer
  if (float % 1 === 0) {
    const int = parseInt(value, 10);
    return int;
  }
  return float;
};

/**
 * checkIfValid
 * Checks to make sure CSV data is formed properly
 * @param {text} data - CSV
 * @param {object} param1
 */
const checkIfValid = (data, { separator }) => {
  if (typeof data !== "string") {
    throw new Error(
      `data has to be typeof: ${typeof ""} but got typeof: ${typeof data}`
    );
  } else if (!data.includes(separator)) {
    throw new Error(`data does not include separator: ${separator}`);
  }
};

/**
 * grabCsv
 * This call fetches CSV data them sends it be processed
 * @param {string} csvLocation
 * @param {string} type
 * @param {string} separator
 * @returns {function}
 */
const grabCsv = (csvLocation, type = "array", separator = ",") => {
  return fetch(csvLocation)
    .then((resp) => resp.text())
    .then((data) => {
      return convertCSVToArray(data, {
        type,
        separator,
      });
    });
};

/**
 * processNamesCSV
 * THis wrapper calls CSV data from location then set the processed result in state
 * @param {*} csvLocation
 */
export const processNamesCSV = (csvLocation) => {
  grabCsv(csvLocation).then((res) => {
    const nameMap = {};
    for (let i = 1; i < res.length; i++) {
      const keyString = `FIPS_${padStart(res[i][1], 2)}${padStart(
        res[i][2],
        3
      )}`;
      nameMap[keyString] = res[i][3];
    }
    setState("nameMap", nameMap);
    const sourceCSV = state.isLive ? timestampSource(state.locations.csv) : state.historicalSource.csv;
    processCSV(timestampSource(sourceCSV));
  });
};

/**
 * buildDictEntry
 * Parses an array to build an entry for the candidate dictionary
 * @param {number} val
 * @param {number} index
 * @param {array} ar
 * @returns {object}
 */
const buildDictEntry = (val, index, ar) => {
  if (!isNaN(val)) {
    return {
      index: val,
      candidate: ar[index + 1],
      party: ar[index + 2] ? ar[index + 2].trim() : "",
    };
  }
};

/**
 * getStatus
 * obtains status for counties by comparing status of state and the reported number for the county
 * @param {number} stateCode - the state code for the county
 * @param {number} reported - the reported number
 */
export const getStatus = (stateCode, reported) => {
  const stateStatus = state.definitions[stateCode].status;
  return stateStatus === "null" ? "null" : reported === 100 ? "called" : "uncalled";
};

/**
 * mapFipsToState
 * Finds the state appreviation to the corresponding FIPS
 * @param {string} fips - string version of FIPS
 */
const mapFipsToState = (fips) => {
  const code = fips.substring(0, 2);
  const res = Object.keys(state.definitions).find(v => {
    return (state.definitions[v].fips && (state.definitions[v].fips === code)) && v;
  });
  return res;
};

// const checkContestedCounty = stateCode => {
//   return state.definitions[stateCode].contested;
// };

/**
 * bindCountyData
 * Inserts county data into countey elements on the map
 * @param {object} countyList
 */
export const bindCountyData = (countyList) => {
  countyList.forEach((v, i) => {
    if (i > 0) {
      const cID = v[0].toString().length < 5 ? "0" + v[0] : v[0].toString();
      const county = document.getElementById("FIPS_" + cID);
      const stateCode = mapFipsToState(cID);
      // const isContested = checkContestedCounty(stateCode);
      if (county) {
        county.setAttribute("data-index", i);
        county.setAttribute("data-reported", v[1]);
        county.setAttribute("data-party", checkParty(i).trim());
        county.setAttribute("data-status", getStatus(stateCode, v[1]));
        county.setAttribute("data-state", stateCode);
      }
    }
  });
};

/**
 * processCSV
 * This wrapper calls CSV data from location then set the processed result in state
 * @param {string} csvLocation
 */
export const processCSV = (csvLocation) => {
  grabCsv(csvLocation).then((res) => {
    setState("csv", res);

    // build candidate dictionary
    setState(
      "dict",
      getState("csv")[0]
        .map(buildDictEntry)
        .filter((i) => i !== undefined)
    );
    
    // bind county data to svg counties
    state.counties && bindCountyData(getState("csv"));
  });
};

/**
 * grabJson
 * This call fetches JSON data them sends it be processed
 * @param {string} jsonLocation
 */
export const grabJson = (jsonLocation) => {
  return fetch(jsonLocation)
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
};

const getParty = st => {
  if (state.pageType === "pre") {
    return st.party;
  }
  let winner = null;
  const sortedResults = sortForWinner(st.results);
  const candidates = buildCandidateList(st.results);
  const preCall = candidates.find((obj) => obj.win);
  if (preCall) {
    winner = preCall.party;
  } else {
    const checkByVote = state.json.candidates.find(can => can.npid === sortedResults[0].candidateNpid && sortedResults[0].votes.count > 0);
    winner = checkByVote ? checkByVote.partyCode.toLowerCase() : null
  }
  // console.log(st.stateCode, "preCall:", preCall && preCall.party);
  return winner;
}

/**
 * parseSplitStateStatus
 * parses a split state code then calls parseStatus for the parent state
 * @param {string} stateCode - the code for a split state
 */
const parseSplitStateStatus = (stateCode) => {
  const parentState = stateCode.split("-")[1];
  const results = state.json.stateResults.find(st => st.stateCode === parentState.toUpperCase())["results"];
  return {
    winner: sortForWinner(results).isWinner,
    poll: state.definitions[parentState].pollStatus
  }
};

/**
 * parseStatus
 * determines if the race is called or uncalled
 * @param {object} targetState - state data
 * @param {array} results - candiate vote data
 */
const parseStatus = (targetState, results) => {
  let { pollStatus, stateCode } = targetState;
  let isWinner = sortForWinner(results)[0].isWinner;
  if (stateCode.length > 2) {
    const splitData = parseSplitStateStatus(stateCode);
    // isWinner = splitData.winner;
    pollStatus = splitData.poll;
  } 
  return isWinner ? "called" : pollStatus ? "uncalled" : "null";
};

/**
 * stashResults
 * places the percent reported data into `state.definitions`
 * @param {object} st - general summary data
 */
const stashResults = st => {
  const {stateCode, expectedPercentage, isFlipped, results} = st;
  const targetState = state.definitions[stateCode.toLowerCase()];
  targetState && (targetState.stateCode = stateCode.toLowerCase());
  targetState && (targetState.reported = expectedPercentage);
  targetState && (targetState.party = getParty(st));
  targetState && (targetState.flipped = isFlipped);
  targetState && (targetState.status = parseStatus(targetState, results));
}

const updateSplitStateCode = code => {
  /**
   * TODO: come back to this if a better solution presents itself
   */
  const location = code.split(" ")[1] || "large";
  const state = code.split("-")[0];
  return location.toLowerCase() === "large"
    ? state
    : `s-${state.toLowerCase()}-0${location}-bg`;
};

/**
 * normalizeSplitStates
 * This funtion normalizes state keys to work with internal data model
 * @param {array} data - results from `grabJson`
 */
const normalizeSplitStates = data => {
  return data.map((state) => {
    const stateRoot = state.stateCode.split("-");
    state.stateCode =
      stateRoot[0] === "NE" || stateRoot[0] === "ME"
        ? updateSplitStateCode(state.stateCode)
        : state.stateCode;
    return state;
  });
};

/**
 * processSummary
 * processes summary results and sets them in state
 * @param {string} jsonLocation
 */
export const processSummary = (res) => {
  const { stateResults, candidates } = res;
  displayLoader(false);
  const normalized = {
    candidates: candidates,
    stateResults: normalizeSplitStates([...stateResults]),
  };
  setState("json", normalized);
  state.json.stateResults.forEach((st) => {
    stashResults(st);
    state.mql.matches && populateDesktop(st);
    populateMobile(st);
  });
};

const toTwelveHour = time => {
  return time.toLocaleString('en-US', { hour: 'numeric', hour12: true }).toLocaleLowerCase().split(" ").join("")
};

const parsePollStrings = (polls, status, tz) => {
  const openHour = toTwelveHour(new Date(polls.open));
  const closeHour = toTwelveHour(new Date(polls.close));
  const strings = {
    "01": `Polls open at ${openHour} ${tz}`,
    "10": "Polls are closed",
    "11": `Polls close at ${closeHour} ${tz}`
  }
  return strings[status];
}

const dateBoolString = polls => {
  const now = new Date();
  const open = polls.open ? new Date(polls.open) : null;
  const close = polls.close ? new Date(polls.close) : null;
  return (open && close) ? `${+(now > open)}${+(now < close)}` : null;
};

/**
 * parsePollStatus
 * determines the race status for each state and returns it as a 2 digit string or null
 * @param {object} polls - dictionary of poll times
 */
const parsePollStatus = polls => {
  Object.keys(state.definitions).forEach(st => {
    const pollStatus = {
      "01": null,
      "10": "closed",
      "11": "open"
    }
    if (st.length === 2) { 
      const boolString = (polls && polls[st]) ? dateBoolString(polls[st]) : null;
      state.definitions[st].pollStatus = pollStatus[boolString];
      state.definitions[st].pollString = parsePollStrings(state.polls[st], boolString, state.definitions[st].tz);
    }
  })
}

/**
 * processPolls
 * processes poll results and sets them in state
 * @param {object} jsonLocation
 */
export const processPolls = (res) => {
  const { states } = res;
  const polls = {};
  const fips = {};
  Object.keys(states).forEach((st) => {
    const lower = st.toLowerCase();
    polls[lower] = states[st].pollTimes;
    fips[lower] = states[st].fips;
    stateDefinitions[lower] && (stateDefinitions[lower].contested = states[st].contested);
    stateDefinitions[lower] && (stateDefinitions[lower].history = states[st].votingHistory);
  });
  setState("polls", polls || {});
  setState("fips", fips || {});
  parsePollStatus(state.polls);
};

const checkTipUpdate = target => {
  const willUpdate = !!target && !target.id.includes("FIPS_");
  willUpdate && stateData({ target: target });
}

export const fullDataGrab = () => {
  fetch(timestampSource(state.locations.polls))
    .then(res => res.json())
    .then(data => {
      processPolls(data);
      return fetch(timestampSource(state.locations.json));
    })
    .then(res => res.json())
    .then(data => {
      processSummary(data);
      processNamesCSV(timestampSource(state.locations.names));

      // initiate data polling
      (state.live === null) && toggleLiveData(true);
      return; 
  })
  .then(() => {
    state.desktop && checkTipUpdate(state.tip.target);
  });
}

export const partialDataGrab = () => {
  fetch(timestampSource(state.locations.json))
    .then(res => res.json())
    .then(data => {
      processSummary(data);
      processNamesCSV(timestampSource(state.locations.names));

      // initiate data polling
      (state.live === null) && toggleLiveData(true);
  });
}

export const historicalDataGrab = sources => {
  fetch(timestampSource(sources.json))
    .then(res => res.json())
    .then(data => {
      processSummary(data);
      processNamesCSV(timestampSource(state.locations.names));
  });
}

export const grabPreData = () => {
  fetch(timestampSource(state.locations.pre))
    .then(res => res.json())
    .then(data => {
      processPre(data);
  });
}

/**
 * initialDataGrab
 * determines if a full or partial data grab is needed
 * based on the existence of poll data
 * @param {object} polls - polling data
 */
export const initialDataGrab = polls => {
  return polls ? partialDataGrab() : fullDataGrab();
}

export const processPre = res => {
  const preData = (res.presidentbar && res.presidentbar.states) ? res.presidentbar.states : null;
  const normalized = {};
  Object.keys(preData).forEach(i => {
    if (!["PR", "VI"].includes(i)) {
      const keyArray = i.split("-");
      const newKey = keyArray.length > 1 ? `s-${keyArray[0].toLowerCase()}-0${keyArray[1]}-bg` : keyArray[0].toLowerCase();
      normalized[newKey] = mapColors[preData[i].partyCode];
    }
  });
  setState("preData", normalized);
  buildPreMobileView(normalized)
  populatePreData(normalized);
}

/**
 * initData
 * this pulls in the initial needed data before populating the component
 * @param {array} endpoints - array of endpoints/urls
 */
export const initData = (endpoints) => {
  return new Promise((resolve, reject) => {
    const fetching = endpoints.map((obj) => fetch(obj.url));
    Promise.all(fetching).then((files) => {
      files.forEach((file, idx) => {
        file.json().then((res) => {
          endpoints[idx].callback(res);
        });
      });
      resolve();
    });
  });
};

const liveDataInterval = () => setInterval(() => {
  logging('--- updating viz-map data --- ')
  fullDataGrab();
}, 15000);

export const toggleLiveData = bool => {
  logging(`viz-map live data: ${bool}`);
  bool ? state.live = liveDataInterval() : clearInterval(state.live);
  setState("isLive", bool);
  state.root.setAttribute("data-live", `${bool}`);
}
