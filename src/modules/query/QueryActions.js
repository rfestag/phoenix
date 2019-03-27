import uuid from "uuid/v4";
import moment from "moment";
/* Types */
export const CREATE_QUERY = "CREATE_QUERY";
export const RESUME_QUERY = "RESUME_QUERY";
export const PAUSE_QUERY = "PAUSE_QUERY";
export const CANCEL_QUERY = "CANCEL_QUERY";
export const DELETE_QUERY = "DELETE_QUERY";
export const COMPLETE_QUERY = "COMPLETE_QUERY";

/* Actions */
export const createQuery = (source, query, name, ageoff) => {
  return {
    type: CREATE_QUERY,
    id: uuid(),
    name: name || `${source} (${moment().format("YYMMDDHHmmSS")})`,
    source,
    query,
    ageoff
  };
};
export const resumeQuery = id => ({ type: RESUME_QUERY, id });
export const pauseQuery = id => ({ type: PAUSE_QUERY, id });
export const cancelQuery = (id, detail) => ({ type: CANCEL_QUERY, id, detail });
export const deleteQuery = id => ({ type: DELETE_QUERY, id });
export const completeQuery = (id, detail) => ({
  type: COMPLETE_QUERY,
  id,
  detail
});
