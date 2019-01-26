import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";

export default class EntityDetails extends Component {
  static propTypes = {
    entity: PropTypes.object
  };

  render() {
    let { entity } = this.props;
    return <span>{entity.id}</span>;
  }
}
