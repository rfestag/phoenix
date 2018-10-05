import React, { Component } from "react";
import PropTypes from "prop-types";
import ColumnManager from "../modules/columns/ColumManager";

export default class RightPanel extends Component {
  static propTypes = {
    panel: PropTypes.object
  };

  render() {
    //TODO: This will be either column or layer manager
    return <ColumnManager />;
  }
}
