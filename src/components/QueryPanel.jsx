import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { createQuery } from "../modules/query/QueryActions";

export const QueryPanel = ({ query }) => <Button onClick={query}>Test</Button>;
QueryPanel.propTypes = {
  query: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch) {
  return {
    query: () => dispatch(createQuery("Test", {}, "My Test"))
  };
}

export default connect(null, mapDispatchToProps)(QueryPanel);
