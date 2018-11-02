import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  FaDrawPolygon,
  FaObjectGroup,
  FaObjectUngroup,
  FaCircle,
  FaSquare,
  FaRuler,
  FaCrosshairs,
  FaFont
} from "react-icons/fa";
import { Input, Button, ButtonGroup } from "reactstrap";

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
        <FaSquare />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FaCircle />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FaDrawPolygon />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FaFont />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FaObjectGroup />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FaObjectUngroup />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FaRuler />
      </ToolbarButton>
      <ToolbarButton color="map-control">
        <FaCrosshairs />
      </ToolbarButton>
    </ButtonGroup>
    <AOISearch placeholder="Search areas of interest" />
  </Wrapper>
);
MapToolbar.propTypes = {
  children: PropTypes.any
};

export default MapToolbar;
