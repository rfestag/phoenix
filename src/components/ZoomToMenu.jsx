import React from "react";
import styled from "styled-components";
import {
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledButtonDropdown as Dropdown
} from "reactstrap";
import { GlobeIcon } from "./Icons";

const DropLeftIconButton = styled(DropdownToggle)`
  padding: 0;
  &:before {
    content: "";
    width: 0;
    height: 0;
    position: absolute;
    bottom: 2px;
    left: 2px;
    border-style: solid;
    border-width: 5px 0 0 5px;
    border-color: transparent transparent transparent
      ${props => props.theme.bodyColor};
  }
`;
export const ZoomToMenu = () => (
  <Dropdown setActiveFromChild direction="left">
    <DropLeftIconButton color="map-control" size="sm">
      <GlobeIcon />
    </DropLeftIconButton>
    <DropdownMenu>
      <DropdownItem>Zoom to World</DropdownItem>
      <DropdownItem>Zoom to Selected</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);
