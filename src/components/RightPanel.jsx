import React, { Component } from "react";
import PropTypes from "prop-types";
import ColumnManager from "../modules/columns/ColumManager";
import { ReflexSplitter, ReflexElement } from "react-reflex";

export default class RightPanel extends Component {
  static propTypes = {
    panel: PropTypes.object.isRequired
    //collapseLeft: PropTypes.func.isRequired,
  };

  render() {
    //TODO: This will be either column or layer manager
    return <ColumnManager />;
  }
}
