import React, { Component } from "react";
import PropTypes from "prop-types";

export default class ValueRenderer extends React.Component {
  static propTypes = {
    colDef: PropTypes.object,
    value: PropTypes.any
  };
  render() {
    // or access props using 'this'
    const formatter = this.props.colDef.valueFormatter;
    const value = formatter ? formatter(this.props) : this.props.value;
    return <span>{value}</span>;
  }
}
