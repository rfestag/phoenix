import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDrawPolygon,
  faVectorSquare,
  faObjectGroup,
  faObjectUngroup,
  faCircle,
  faSquare,
  faRuler,
  faCrosshairs,
  faFont
} from "@fortawesome/free-solid-svg-icons";
import { Input, Button, ButtonGroup } from "reactstrap";

library.add(
  faDrawPolygon,
  faVectorSquare,
  faObjectGroup,
  faObjectUngroup,
  faCircle,
  faSquare,
  faRuler,
  faCrosshairs,
  faFont
);

const Wrapper = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 500;
  display: flex;
`;
const AOISearch = styled(Input)`
  float: right;
  width: 300px !important;
  border: none !important;
  box-shadow: none !important;
`;
const Filler = styled.div`
  flex: 1;
  background-color: ${props => props.theme.mapControlBg};
`;
const ToolbarButton = styled(Button)`
  border: none !important;
`;

const MapToolbar = ({ children }) => (
  <Wrapper>
    <Filler />
    <ButtonGroup>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="square" />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="circle" />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="draw-polygon" />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="font" />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="object-group" />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="object-ungroup" />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="ruler" />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FontAwesomeIcon icon="crosshairs" />
      </ToolbarButton>
    </ButtonGroup>
    <AOISearch placeholder="Search areas of interest" />
  </Wrapper>
);
MapToolbar.propTypes = {
  children: PropTypes.any
};

export default MapToolbar;
