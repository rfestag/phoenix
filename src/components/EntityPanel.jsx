import React, { Component } from "react";
import PropTypes from "prop-types";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import _ from "lodash";

const getFocusedEntityId = (state, props) => state.collection.focused;
const getCollections = (state, props) => state.collection.collections;
const getEntity = createSelector(
  [getFocusedEntityId, getCollections],
  (id, collections) => {
    const collectionWithEntity = _.find(collections, c => {
      return c.data[id];
    });
    let entity = collectionWithEntity
      ? collectionWithEntity.data[id]
      : undefined;
    return entity;
  }
);

export class EntityPanel extends Component {
  static propTypes = {
    entity: PropTypes.object
  };

  render() {
    let { entity } = this.props;
    return <span>{entity ? entity.id : "No selected entity"}</span>;
  }
}

function mapStateToProps(state, props) {
  return {
    entity: getEntity(state, props)
  };
}
export default connect(mapStateToProps, null)(EntityPanel);
