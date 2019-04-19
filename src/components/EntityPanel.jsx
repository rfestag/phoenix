import React, { Component } from "react";
import PropTypes from "prop-types";
import EntityDetails from "./EntityDetails";
import EntityList from "./EntityList";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import _ from "lodash";

const getFocusedEntityId = (state, props) => state.collection.focused;
const getCollections = (state, props) => state.collection.collections;
const getFocusedCollection = createSelector(
  [getFocusedEntityId, getCollections],
  (id, collections) => _.find(collections, c => c.data[id])
);
const getCollectionFields = createSelector(
  [getFocusedCollection],
  collection => (collection ? collection.fields.properties : [])
);
const getEntity = createSelector(
  [getFocusedEntityId, getFocusedCollection],
  (id, collectionWithEntity) => {
    let entity = collectionWithEntity
      ? { ...collectionWithEntity.data[id] } //Hack to force update
      : undefined;
    return entity;
  }
);

export class EntityPanel extends Component {
  static propTypes = {
    entity: PropTypes.object,
    propertyDefs: PropTypes.array
  };

  render() {
    let { entity, propertyDefs } = this.props;
    return entity ? (
      <EntityDetails entity={entity} propertyDefs={propertyDefs} />
    ) : (
      <EntityList />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    entity: getEntity(state, props),
    propertyDefs: getCollectionFields(state, props)
  };
}
export default connect(mapStateToProps, null)(EntityPanel);
