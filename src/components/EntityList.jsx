import React, { Component } from "react";
import PropTypes from "prop-types";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import _ from "lodash";

const getCollections = (state, props) => state.collection.collections;
const getEntities = createSelector([getCollections], collections => {
  return _.reduce(
    collections,
    (entities, collection, cid) => {
      return _.reduce(
        collection.data,
        (entities, entity, eid) => {
          entities.push(entity);
          return entities;
        },
        entities
      );
    },
    []
  );
});

export class EntityPanel extends Component {
  static propTypes = {
    entities: PropTypes.array
  };

  render() {
    let { entities } = this.props;
    return (
      <div>
        <h3>Entities</h3>
        <span>{entities.length}</span>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    entities: getEntities(state, props)
  };
}
export default connect(mapStateToProps, null)(EntityPanel);
