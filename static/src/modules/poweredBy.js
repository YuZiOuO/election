import { determineTier } from "./utilities"
import { processPolls } from "./processSources";
import { setState } from "./state";

const shouldPush = (result, checkTier) => {
  return (result) || !result && (checkTier === determineTier(window.location));
}

export const poweredByCheck = override => {
  const timestamp = new Date().getTime();
  const checkTier = override ? "stage-" : determineTier(window.location);
  const adminSource = `//${checkTier}feeds-elections.foxnews.com/archive/politics/elections/2020/1/admin-general.json?cb=${timestamp}`
  return fetch(adminSource)
    .then((res) => res.json())
    .then((data) => {
      const { generalsettings } = data;
      const result = !!generalsettings.powerByStage;
      setState("plan", generalsettings.outagePlan || 3);
      setState("adminTier", result ? checkTier : determineTier(window.location));
      shouldPush(result, checkTier) && processPolls(data);
      return result;
  });
};