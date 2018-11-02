import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledButtonDropdown as Dropdown
} from "reactstrap";
import { FaGlobeAmericas } from "react-icons/fa";

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
    <DropLeftIconButton size="sm">
      <FaGlobeAmericas />
    </DropLeftIconButton>
    <DropdownMenu>
      <DropdownItem>Zoom to World</DropdownItem>
      <DropdownItem>Zoom to Selected</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);
