import _ from "lodash";
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
  BATCH_UPDATE_COLLECTIONS,
  UPDATE_COLLECTION_FIELDS,
  DELETE_FROM_COLLECTION,
  SET_SELECTED_ENTITIES,
  SET_AGEOFF,
  TOGGLE_SELECTED_ENTITIES,
  CLEAR_ALL_SELECTIONS,
  SET_CURRENT_COLLECTION,
  SET_FOCUSED_ENTITY
} from "./CollectionActions";
import { updateEntity } from "../entities/entities";
import { getDefaultColumns } from "../columns/Constants";
const initialState = { focused: null, collections: {} };

function updateCollection(collection, action) {
  let fields = {
    properties: { ...collection.fields.properties },
    geometries: { ...collection.fields.geometries }
  };
  const now = Date.now();
  //console.time("Update")
  let data = { ...collection.data };
  let keys = Object.keys(action.data);
  for (let i = 0; i < keys.length; i++) {
    let id = keys[i];
    let updates = action.data[id];
    let isNew = data[id] === undefined;
    const [updatedEntity, updatedFields] = updateEntity(
      data[id],
      updates,
      fields,
      collection.ageoff
    );
    updatedEntity.updateTime = now;
    if (isNew) updatedEntity.createTime = now;
    data[id] = updatedEntity;
    fields = updatedFields;
  }
  /*
  let data = _.reduce(
    action.data,
    (data, updates, id) => {
      let isNew = data[id] === undefined;
      const [updatedEntity, updatedFields] = updateEntity(
        data[id],
        updates,
        fields,
        collection.ageoff
      );
      updatedEntity.updateTime = now;
      if (isNew) updatedEntity.createTime = now;
      data[id] = updatedEntity;
      fields = updatedFields;
      return data;
    },
    //collection.data
    { ...collection.data }
  );
  */
  //console.timeEnd("Update")

  return { ...collection, fields, data };
}
export default function(state = initialState, action) {
  const id = action.id;
  let collection;
  let now = Date.now();
  switch (action.type) {
    case CREATE_COLLECTION:
      collection = state.collections[id];
      console.log("Creating", action);
      if (collection) {
        console.error("Cannot create collection (already exists)", id);
        return state;
      } else {
        collection = {
          id,
          ageoff: action.ageoff, //{ value: 1, unit: "minute" },
          name: action.name,
          queries: action.queries,
          visible: true,
          fields: { geometries: {}, properties: getDefaultColumns() },
          selected: {},
          data: {}
        };
        return {
          ...state,
          current: id,
          collections: { ...state.collections, [id]: collection }
        };
      }
    case DELETE_COLLECTION:
      const { [id]: deleted, ...collections } = state.collections;
      if (deleted) return { ...state, collections };
      else {
        console.error("Cannot delete collection (does not exist)", id);
        return state;
      }
    case DELETE_FROM_COLLECTION:
      collection = state.collections[id];
      let data = _.omit(collection.data, action.ids);
      console.log("Deleting", action.ids.length);
      return {
        ...state,
        collections: { ...state.collections, [id]: { ...collection, data } }
      };
    case BATCH_UPDATE_COLLECTIONS:
      const updatedCollections = _.reduce(
        action.allUpdates,
        (collections, action) => {
          const collection = collections[action.id];
          if (collection)
            collections[action.id] = updateCollection(collection, action);
          return collections;
        },
        { ...state.collections }
      );
      return { ...state, collections: updatedCollections };
    case UPDATE_COLLECTION:
      collection = state.collections[id];
      if (collection) {
        collection = updateCollection(collection, action);
        return {
          ...state,
          collections: { ...state.collections, [id]: collection }
        };
      } else {
        console.error("Cannot update collection (does not exist)", id);
        return state;
      }
    case UPDATE_COLLECTION_FIELDS:
      console.log("Updating collection fields", action);
      collection = state.collections[id];
      if (collection) {
        collection = { ...collection, fields: action.fields };
        return {
          ...state,
          collections: { ...state.collections, [id]: collection }
        };
      } else {
        return state;
      }
    case SET_SELECTED_ENTITIES:
      console.log("Setting selected entities");
      collection = state.collections[id];
      if (collection) {
        if (action.clear) {
          for (let id in collection.selected) {
            if (collection.data[id]) collection.data[id].updateTime = now;
          }
        }
        collection.selected = action.ids.reduce((selected, id) => {
          if (collection.data[id]) collection.data[id].updateTime = now;
          selected[id] = true;
          return selected;
        }, action.clear ? {} : { ...collection.selected });
        return {
          ...state,
          collections: { ...state.collections, [id]: { ...collection } }
        };
      } else {
        return state;
      }
    case TOGGLE_SELECTED_ENTITIES:
      console.log("Toggling selected entities");
      collection = state.collections[id];
      if (collection) {
        if (action.clear) {
          for (let id in collection.selected) {
            if (collection.data[id]) collection.data[id].updateTime = now;
          }
        }
        collection.selected = action.ids.reduce((selected, id) => {
          selected[id] = !collection.selected[id];
          if (collection.data[id]) collection.data[id].updateTime = now;
          return selected;
        }, action.clear ? {} : { ...collection.selected });
        return {
          ...state,
          collections: { ...state.collections, [id]: { ...collection } }
        };
      } else {
        return state;
      }
    case CLEAR_ALL_SELECTIONS:
      state.collections = _.reduce(
        state.collections,
        (collections, collection, id) => {
          for (let id in collection.selected) {
            if (collection.data[id]) collection.data[id].updateTime = now;
          }
          collection = { ...collection, selected: {} };
          collections[id] = collection;
          return collections;
        },
        {}
      );
      return { ...state };
    case SET_CURRENT_COLLECTION:
      return {
        ...state,
        current: id
      };
    case SET_FOCUSED_ENTITY:
      return {
        ...state,
        focused: action.id
        /*
        collections: {
          ...state.collections,
          [id]: { ...collection, focused: action.eid }
        }
        */
      };
    default:
  }
  return state;
}
