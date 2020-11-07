import { state, setState } from "./state";
import SendHeight from "./sender";

/**
 * checkParty
 * @param {integer} index - county index value for `state.csv`
 */
export const checkParty = (index) => {
  const countyData = state.csv[index].slice(2);
  const list = [];
  countyData.forEach((v, i, a) => {
    ((i % 2 < 1) && state.dict[v] !== undefined) &&
      list.push({
        candidate: `${state.dict[v].candidate}`,
        votes: a[i + 1] || 0,
        party: `${state.dict[v].party}` || "",
      });
  });
  const lead = list.length > 0 ? list.sort((a, b) => b.votes - a.votes) : null;
  return (lead && lead[0].votes > 0) ? lead[0].party : "";
};

export const sortForWinner = results => {
  const hasWinner = results.sort((a,b ) => b.isWinner - a.isWinner);
  return hasWinner;
}

export const buildCandidateList = results => {
  return results.map(res => {
    const name = processResults(res.candidateNpid, "candidates", "npid");
    return {
      party: name.partyCode,
      name: name,
      count: res.votes.count,
      percent: res.votes.percentage.toFixed(1),
      win: res.isWinner
   };
  });
};

/**
 * throttle
 * @param {integer} delay 
 * @param {function} fn 
 */
export const throttle = (delay, fn) => {
  let inThrottle = false;
  return (args) => {
    if (inThrottle) {
      return;
    }
    inThrottle = true;
    fn(args);
    setTimeout(() => {
      inThrottle = false;
    }, delay);
  };
};

/**
 * processResults
 * @param {string} match 
 * @param {string} key 
 * @param {string} sub
 * @returns {object} 
 */
export const processResults = (match, key, sub) => {
  let results = {};
  let i = 0;
  while (i < state.json[key].length) {
    if (state.json[key][i][sub] === match) {
      results = state.json[key][i];
      break;
    }
    i++
  }
  return results;
}

/**
 * padStart
 * @param {integer} num 
 * @param {integer} size 
 */
export const padStart = function(num, size) {
  var s = String(num);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

/**
 * parseId
 * Parses out the id from an element
 * @param {element} el 
 */
export const parseId = el => {
  const idArray = el.id.split('-');
  return idArray.length > 1 ? idArray[1] : idArray[0];
};

/**
 * formatNumber
 * @param {integer} num 
 */
export const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

/**
 * deepClone
 * deep clone an object
 * @param {object} inObject 
 */
export const deepClone = inObject => {
  let outObject, value, key
  if (typeof inObject !== "object" || inObject === null) { // return if this is not an object
    return inObject;
  }
  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}
  for (key in inObject) {
    value = inObject[key]
    outObject[key] = deepClone(value)
  }
  return outObject;
}

/**
 * rng
 * this is a random number generator with options for maximum and a minumum number
 * @param {number} max - maximum potential number
 * @param {number} min - minumum potential number
 */
export const rng = (max = 100, min = 0) => {
  return Math.floor(Math.random() * Math.floor(max - min)) + min;
}

/**
 * rafAsync
 * using requestAnimation frame to recheck for element
 */
const rafAsync = () => {
  return new Promise(resolve => {
      requestAnimationFrame(resolve);
  });
}

/**
 * checkElement
 * checking DOM for element until it exists then returning a promise
 * @param {selector} selector 
 */
export const checkElement = selector => {
  if (document.querySelector(selector) === null) {
      return rafAsync().then(() => checkElement(selector));
  } else {
      return Promise.resolve(true);
  }
}

/**
 * checkSendHeight
 * checks if `state.display` has been set and will trigger `SendHeight` if not, then set `state.display` to true
 */
export const checkSendHeight = () => {
  if (!state.display) {
    SendHeight();
    setState("display", true);
  }
}

/**
 * getQueryVariable
 * an IE11 compatible ponyfill for URLSeachParams
 * @param {string} param - the parameter to search for
 * @param {string} location - window.location.search
 */
export const getQueryVariable = (param, location) => {
  const query = location.substring(1);
  const result = query.split('&').find((i) => i.includes(`${param}=`));
  return result ? result.split('=')[1] : null;
};


/**
 * determineTier
 * using data from `window.location` this function will determine which tier the componenet is currently running on
 * @param {object} location - window.location value
 */
export const determineTier = location => {
  const tiers = {
    dev: "dev-",
    stage: "stage-",
    localhost: "dev-"
  }
  const host = location.hostname.split("-")[0];
  return tiers[host] ? tiers[host] : ""
};

/**
 * checkForOverride
 * checks for the override value in the query params to override the pre state
 * @param {object} location - window.location value
 */

export const checkForOverride = location => {
  const isOveridden = getQueryVariable("mode", location) === "election_day";
  setState("override", isOveridden);
};

/**
 * toggleDesktopMobile
 * check the size of the parent document to determine if the display status is mobile or desktop
 */
export const toggleDesktopMobile = () => {
  const display = (parent.document.body.clientWidth > 768) ? "desktop" : "mobile";
  state.root.setAttribute("data-display", display);
};

/**
 * resizeWatcher
 * sets up an event listener for the resize event that will trigger the passed callback
 * @param {function} func - callback to be leveraged
 * @param {boolean} auto - to determine if callback will be fired automatically
 */
export const resizeWatcher = (func, auto = true) => {
  auto && func();
  window.addEventListener('resize', throttle(150, func));
};

export const logging = data => {
  (state.tier === "stage-" || state.tier === "dev-") && console.log(data)
}