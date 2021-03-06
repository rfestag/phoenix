/* Types */
export const AGEOFF_COLLECTION = "AGEOFF_COLLECTION";
export const SET_AGEOFF = "SET_AGEOFF";
export const SET_OBSERVATION_AGEOFF = "SET_AGEOFF";
export const CREATE_COLLECTION = "CREATE_COLLECTION";
export const DELETE_COLLECTION = "DELETE_COLLECTION";
export const DELETE_FROM_COLLECTION = "DELETE_FROM_COLLECTION";
export const SELECT_ENTITIES = "SELECT_ENTITIES";
export const SET_SELECTED_ENTITIES = "SET_SELECTED_ENTITIES";
export const TOGGLE_SELECTED_ENTITIES = "TOGGLE_SELECTED_ENTITIES";
export const CLEAR_ALL_SELECTIONS = "CLEAR_ALL_SELECTIONS";
export const UPDATE_COLLECTION = "UPDATE_COLLECTION";
export const BATCH_UPDATE_COLLECTIONS = "BATCH_UPDATE_COLLECTIONS";
export const UPDATE_COLLECTION_FIELDS = "UPDATE_COLLECTION_FIELDS";
export const SUBSCRIBE_TO_QUERY = "SUBSCRIBE_TO_QUERY";
export const SET_CURRENT_COLLECTION = "SET_CURRENT_COLLECTION";
export const SET_FOCUSED_ENTITY = "SET_FOCUSED_ENTITY";

/**
 * @typedef {Object} PropertyUpdate
 * @property {any} value The value of the property.
 * @property {number} time The time of the update (integer in ms).
 */

/**
 * @typedef {Object} EntityUpdate
 * @property {string} id The entity id. This should be globally unique.
 * @property {string} label The entity label. This is a display value for the entity.
 * @property {Object} properties An object representing the property updates. See {@link PropertyUpdate} for more information
 * @property {Object} geometries An object representing the geometry updates. See TODO:GeometryCollection for more information
 */

/* Actions */
/**
 * This action is used to create a new collection. Generally, you shouldn't need to call it yourself
 * from components. Instead, it would be better to create a query, which will automatically
 * create the appropriate collection.
 * @param {string} id - A uuid for the collection. It will serve as the primary identifier
 * @param {string} name - A descriptive display name for the collection.
 * @param {string[]} queries - An array of query uuids that feed into this collection.
 * @return {Object} A CREAT_COLLECTION action object.
 */
export const createCollection = (id, name, queries, ageoff) => ({
  type: CREATE_COLLECTION,
  id,
  name,
  queries,
  ageoff
});

/**
 * This action is used to delete an existing collection
 * @param {string} id - The uuid of the collection to delete
 * @return {Object} A DELETE_COLLECTION action object.
 */
export const deleteCollection = id => ({
  type: DELETE_COLLECTION,
  id
});

/**
 * This action is used to update the data within a collection.
 * Each key in the data parameter represents the unique id for an entity. The value will be an {@link EntityUpdate}
 * @param {string} id - The uuid of the collection being updated.
 * @param {string} qid - The uuid of the query this update is coming from.
 * @param {Object} data - An object representing entities to update.
 * @return {Object} An UPDATE_COLLECTION action object.
 */
export const updateCollection = (id, qid, data) => ({
  type: UPDATE_COLLECTION,
  id,
  qid,
  data
});
/**
 * This action is used to group many update operations together. It allows us to buffer the actions generated by queries, and periodically execute all of them without extra overhead.
 * @param {Object[]} allUpdates - An array of update actions to execute. Each entry should be the result of a call to {@link updateCollection}
 * @return {Object} A BATCH_UPDATE_COLLECTION action object.
 */
export const batchUpdateCollections = allUpdates => ({
  type: BATCH_UPDATE_COLLECTIONS,
  allUpdates
});
/**
 * NOT IMPLEMENTED YET, DO NOT USE
 */
export const subscribeToQuery = (id, qid) => ({
  type: SUBSCRIBE_TO_QUERY,
  id,
  qid
});
/**
 * This action is used delete entities from a collection.
 * @param {string} id - The uuid of the collection to remove entities from
 * @param {string[]} ids - The identifier for the entities to delete
 * @return {Object} A DELETE_FROM_COLLECTION action object.
 */
export const deleteFromCollection = (id, ids) => ({
  type: DELETE_FROM_COLLECTION,
  id,
  ids
});
/**
 * NOT IMPLEMENTED YET, DO NOT USE
 */
export const setAgeoff = (id, ageoff) => ({
  type: SET_AGEOFF,
  id,
  ageoff
});
/**
 * This action is used toggle the selected status of entities in a collection.
 * It allows you to choose between completely replacing the selection state using the `clear` parameter.
 * If clear is truthy, we basically merge the "toggled" state of the selected entities into a new object, which treats all non-identified entities as "Not selected".
 * If clear is falsey, we mergee the "toggled" state of the selected entities into the current state, which leave all non-identified entities unchanged from before.
 * @param {string} id - The uuid of the collection to modify selection of
 * @param {string[]} ids - The identifier for the entities modify selection of
 * @param {boolean} clear - Whether to clear the current state. This is used to make it easier to effectively "unselect all and toggle previous selection state".
 * @return {Object} A TOGGLE_SELECTED_ENTITIES action object.
 */
export const toggleSelectedEntities = (id, ids, clear) => ({
  type: TOGGLE_SELECTED_ENTITIES,
  id,
  ids,
  clear
});
/**
 * This action is used to set all specified entities as selected.
 * It allows you to choose between completely replacing the selection state using the `clear` parameter.
 * If clear is truthy, we basically change the selection to only those enumerated in the `ids` parameter.
 * If clear is falsey, we add the entities numerated in the `ids` parameter to the selection, leaving everything else unchanged from before.
 * @param {string} id - The uuid of the collection to modify selection of
 * @param {string[]} ids - The identifier for the entities modify selection of
 * @param {boolean} clear - Whether to clear the current state. This is used to make it easier to either replace the selection or add to the selection
 * @return {Object} A SET_SELECTED_ENTITIES action object.
 */
export const setSelectedEntities = (id, ids, clear) => ({
  type: SET_SELECTED_ENTITIES,
  id,
  ids,
  clear
});
export const clearAllSelections = id => ({
  type: CLEAR_ALL_SELECTIONS
});
/**
 * NOT IMPLEMENTED YET, DO NOT USE
 */
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
/**
 * NOT IMPLEMENTED YET, DO NOT USE
 */
export const ageoffCollection = id => ({
  type: AGEOFF_COLLECTION,
  id
});
export const setCurrentCollection = id => ({
  type: SET_CURRENT_COLLECTION,
  id
});
/**
 * NOT IMPLEMENTED YET, DO NOT USE
 */
export const setFocusedEntity = id => ({
  type: SET_FOCUSED_ENTITY,
  id
});
