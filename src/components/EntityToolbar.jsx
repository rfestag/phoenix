import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Input, Button, ButtonGroup } from "reactstrap";
import {
  PullTrackIcon,
  WhatsHereToolIcon,
  MoreIcon,
  CenterIcon
} from "./Icons";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
`;
const ToolbarButton = styled(Button)`
  border: none !important;
`;

const EntityToolbar = ({ children }) => (
  <Wrapper>
    <ButtonGroup style={{ width: "100%" }}>
      <ToolbarButton color="map-control" style={{ flex: 1 }}>
        <CenterIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control" style={{ flex: 1 }}>
        <PullTrackIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control" style={{ flex: 1 }}>
        <WhatsHereToolIcon />
      </ToolbarButton>
      <ToolbarButton color="map-control" style={{ flex: 1 }}>
        <MoreIcon />
      </ToolbarButton>
    </ButtonGroup>
  </Wrapper>
);
EntityToolbar.propTypes = {
  children: PropTypes.any
};

export default EntityToolbar;
