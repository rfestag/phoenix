import React, { Component } from "react";
import PropTypes from "prop-types";
import Control from "react-leaflet-control";
import { Button, ButtonGroup } from "reactstrap";
import { connect } from "react-redux";
import styled from "styled-components";
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobeAmericas,
  faLayerGroup,
  faMap,
  faPlus,
  faMinus
} from "@fortawesome/free-solid-svg-icons";
import {
  RIGHT_PANEL,
  LAYER_PANE,
  toggleLayerPane
} from "../panel/PanelActions";

library.add(faGlobeAmericas, faLayerGroup, faMap, faPlus, faMinus);

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 500;
  margin-right: 5px;
  margin-bottom: 5px;
`;

const ToolGroup = styled(ButtonGroup)`
  margin: 5px;
`;
const LeftArrowActiveButton = styled(Button)`
  .active&:before {
    content: "";
    position: absolute;
    border-left: 10px solid ${props => props.theme.accentColor};
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    left: 100%;
    top: 5px;
  }
`;

export const ViewControl = ({ active, toggleLayerManager }) => (
  <Wrapper>
    <ToolGroup vertical>
      <LeftArrowActiveButton
        active={active}
        color="map-control"
        size="sm"
        onClick={toggleLayerManager}
      >
        <FontAwesomeIcon icon="layer-group" />
      </LeftArrowActiveButton>
      <Button color="map-control" size="sm">
        <FontAwesomeIcon icon="map" />
      </Button>
    </ToolGroup>
    <ToolGroup vertical>
      <Button color="map-control" size="sm">
        <FontAwesomeIcon icon="plus" />
      </Button>
      <Button color="map-control" size="sm">
        <FontAwesomeIcon icon="globe-americas" />
      </Button>
      <Button color="map-control" size="sm">
        <FontAwesomeIcon icon="minus" />
      </Button>
    </ToolGroup>
  </Wrapper>
);

ViewControl.propTypes = {
  active: PropTypes.bool,
  toggleLayerManager: PropTypes.func
};

function mapStateToProps(state) {
  return {
    active: state.panel[RIGHT_PANEL] === LAYER_PANE,
    map: state.map
  };
}
function mapDispatchToProps(dispatch) {
  return {
    toggleLayerManager: () => dispatch(toggleLayerPane())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewControl);
