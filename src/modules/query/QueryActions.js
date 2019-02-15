import uuid from "uuid/v4";
import moment from "moment";
/* Types */
export const CREATE_QUERY = "CREATE_QUERY";
export const RESUME_QUERY = "RESUME_QUERY";
export const PAUSE_QUERY = "PAUSE_QUERY";
export const CANCEL_QUERY = "CANCEL_QUERY";
export const DELETE_QUERY = "DELETE_QUERY";

/* Actions */
export const createQuery = (source, query, name) => {
  return {
    type: CREATE_QUERY,
    id: uuid(),
    name: name || `${source} (${moment().format("YYMMDDHHmmSS")})`,
    source,
    query
  };
};
export const resumeQuery = id => ({ type: RESUME_QUERY, id });
export const pauseQuery = id => ({ type: PAUSE_QUERY, id });
export const cancelQuery = id => ({ type: CANCEL_QUERY, id });
export const deleteQuery = id => ({ type: DELETE_QUERY, id });
