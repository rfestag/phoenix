import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import styled from "styled-components";
import { Input, Button, ButtonGroup } from "reactstrap";
import { clearAllSelections } from "../collection/CollectionActions";
import _ from "lodash";

const getSelectedCount = (state, props) => {
  return _.reduce(
    state.collection.collections,
    (count, collection) => {
      return (count += Object.keys(collection.selected).length);
    },
    0
  );
};

const Wrapper = styled.div`
  width: 100%;
  position: absolute;
  top: 36px;
  z-index: 500;
  display: flex;
`;
const Filler = styled.div`
  flex: 1;
  background-color: ${props => props.theme.selectbarBg};
`;
const ToolbarButton = styled(Button)`
  border: none !important;
`;

const Selectbar = ({ selectedCount, clearAllSelections }) => {
  return (
    selectedCount && (
      <Wrapper>
        <ButtonGroup>
          <ToolbarButton color="select" onClick={clearAllSelections}>
            Clear
          </ToolbarButton>
        </ButtonGroup>
        <Filler />
      </Wrapper>
    )
  );
};
Selectbar.propTypes = {
  selectedCount: PropTypes.number,
  clearAllSelections: PropTypes.func
};

function mapStateToProps(state, props) {
  return {
    selectedCount: getSelectedCount(state, props)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      clearAllSelections
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Selectbar);
