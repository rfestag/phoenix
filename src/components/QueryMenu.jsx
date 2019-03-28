import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createSelector } from "reselect";
import {
  resumeQuery,
  pauseQuery,
  cancelQuery,
  deleteQuery
} from "../modules/query/QueryActions";

import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const SelectFeedBtn = styled(DropdownToggle)`
  width: 300px;
  text-align: left !important;
`;

const getQueries = (state, props) => state.query;
const getActiveQueries = createSelector([getQueries], queries =>
  _.filter(queries, q => !q.done)
);
const getCompleteQueries = createSelector([getQueries], queries =>
  _.filter(queries, q => q.done)
);

const queryList = (group, queries) => {
  if (queries.length) {
    return [
      <DropdownItem key="header" header>
        {group}
      </DropdownItem>
    ].concat(
      queries.map(q => <DropdownItem key={q.id}>{q.name}</DropdownItem>)
    );
  } else {
    return null;
  }
};

const QueryMenu = ({ activeQueries, completeQueries, savedQueries }) => (
  <Dropdown setActiveFromChild>
    <SelectFeedBtn>Select feed...</SelectFeedBtn>
    <DropdownMenu>
      {activeQueries.length + completeQueries.length + savedQueries.length ===
        0 && <DropdownItem header>No active or saved queries</DropdownItem>}
      <div>{queryList("Active", activeQueries)}</div>
      <div>{queryList("Complete", completeQueries)}</div>
      <div>{queryList("Saved", savedQueries)}</div>
    </DropdownMenu>
  </Dropdown>
);
QueryMenu.propTypes = {
  activeQueries: PropTypes.array,
  completeQueries: PropTypes.array,
  savedQueries: PropTypes.array
};

const DEFAULT_SAVED_QUERIES = [];

function mapStateToProps(state, props) {
  return {
    activeQueries: getActiveQueries(state, props),
    completeQueries: getCompleteQueries(state, props),
    savedQueries: DEFAULT_SAVED_QUERIES
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      resumeQuery,
      pauseQuery,
      cancelQuery,
      deleteQuery
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(QueryMenu);
