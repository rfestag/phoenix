/* Types */
export const AGEOFF_COLLECTION = "AGEOFF_COLLECTION";
export const SET_ENTITY_AGEOFF = "SET_AGEOFF";
export const SET_OBSERVATION_AGEOFF = "SET_AGEOFF";
export const CREATE_COLLECTION = "CREATE_COLLECTION";
export const DELETE_COLLECTION = "DELETE_COLLECTION";
export const DELETE_FROM_COLLECTION = "DELETE_FROM_COLLECTION";
export const SELECT_ENTITIES = "SELECT_ENTITIES";
export const SET_SELECTED_ENTITIES = "SET_SELECTED_ENTITIES";
export const UPDATE_COLLECTION = "UPDATE_COLLECTION";
export const UPDATE_COLLECTION_FIELDS = "UPDATE_COLLECTION_FIELDS";
export const SET_CURRENT_COLLECTION = "SET_CURRENT_COLLECTION";
export const SET_FOCUSED_ENTITY = "SET_FOCUSED_ENTITY";

/* Actions */
export const createCollection = (id, name, queries) => ({
  type: CREATE_COLLECTION,
  id,
  name,
  queries
});
export const deleteCollection = id => ({
  type: DELETE_COLLECTION,
  id
});
export const updateCollection = (id, data) => ({
  type: UPDATE_COLLECTION,
  id,
  data
});
export const deleteFromCollection = (id, ids) => ({
  type: DELETE_FROM_COLLECTION,
  id,
  ids
});
export const setEntityAgeoff = (id, ageoff) => ({
  type: SET_ENTITY_AGEOFF,
  id,
  ageoff
});
export const selectEntities = (id, ids) => ({
  type: SELECT_ENTITIES,
  id,
  ids
});
export const setSelectedEntities = (id, ids) => ({
  type: SET_SELECTED_ENTITIES,
  id,
  ids
});
export const setObservationAgeoff = (id, ageoff) => ({
  type: SET_OBSERVATION_AGEOFF,
  id,
  ageoff
});
export const updateCollectionFields = (id, fields) => ({
  type: UPDATE_COLLECTION_FIELDS,
  id,
  fields
});
export const ageoffCollection = id => ({
  type: AGEOFF_COLLECTION,
  id
});
export const setCurrentCollection = (id, eid) => ({
  type: SET_CURRENT_COLLECTION,
  id,
  eid
});
