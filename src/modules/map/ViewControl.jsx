import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Button, ButtonGroup } from "reactstrap";
import { connect } from "react-redux";
import {
  LayersIcon,
  MiniMapIcon,
  ZoomInIcon,
  ZoomOutIcon
} from "../../components/Icons";
import {
  RIGHT_PANEL,
  LAYER_PANE,
  toggleLayerPane
} from "../panel/PanelActions";
import { ZoomToMenu } from "../../components/ZoomToMenu";

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
const RightArrowActiveButton = styled(Button)`
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
const LeftArrowActiveButton = styled(Button)`
  .active&:before {
    content: "";
    position: absolute;
    border-right: 10px solid ${props => props.theme.accentColor};
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    right: 100%;
    top: 5px;
  }
`;

export const ViewControl = ({
  layerManagerActive,
  miniMapActive,
  toggleLayerManager,
  toggleMiniMap
}) => (
  <Wrapper>
    <ToolGroup vertical>
      <RightArrowActiveButton
        active={layerManagerActive}
        color="map-control"
        size="sm"
        onClick={toggleLayerManager}
      >
        <LayersIcon size="1.25em" />
      </RightArrowActiveButton>
    </ToolGroup>
    <ToolGroup vertical>
      <ZoomToMenu />
      <Button color="map-control" size="sm">
        <ZoomInIcon />
      </Button>
      <Button color="map-control" size="sm">
        <ZoomOutIcon />
      </Button>
    </ToolGroup>
    <ToolGroup vertical>
      <LeftArrowActiveButton
        active={miniMapActive}
        color="map-control"
        size="sm"
        onClick={toggleMiniMap}
      >
        <MiniMapIcon size="1.25em" />
      </LeftArrowActiveButton>
    </ToolGroup>
  </Wrapper>
);

ViewControl.propTypes = {
  layerManagerActive: PropTypes.bool,
  miniMapActive: PropTypes.bool,
  toggleLayerManager: PropTypes.func,
  toggleMiniMap: PropTypes.func
};

function mapStateToProps(state) {
  return {
    layerManagerActive: state.panel[RIGHT_PANEL] === LAYER_PANE,
    map: state.map
  };
}
function mapDispatchToProps(dispatch) {
  return {
    toggleLayerManager: () => dispatch(toggleLayerPane())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewControl);
