import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Input, Button, ButtonGroup } from "reactstrap";
import {
  PolygonToolIcon,
  GroupToolIcon,
  UngroupToolIcon,
  CircleToolIcon,
  BoxToolIcon,
  MeasureToolIcon,
  WhatsHereToolIcon,
  LabelToolIcon
} from "../../components/Icons";

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
        <BoxToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <CircleToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <PolygonToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <LabelToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <GroupToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <UngroupToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <MeasureToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <WhatsHereToolIcon />
      </ToolbarButton>
    </ButtonGroup>
    <AOISearch placeholder="Search areas of interest" />
  </Wrapper>
);
MapToolbar.propTypes = {
  children: PropTypes.any
};

export default MapToolbar;
