import React from "react";
import PropTypes from "prop-types";
import { UncontrolledButtonDropdown as Dropdown } from "reactstrap";

const DropdownSubMenu = ({ direction, children }) => (
  <Dropdown
    direction={direction || "right"}
    className=""
    style={{ width: "100%" }}
    setActiveFromChild
  >
    {children}
  </Dropdown>
);

DropdownSubMenu.propTypes = {
  direction: PropTypes.oneOf(["up", "down", "left", "right"]),
  children: PropTypes.any
};
export default DropdownSubMenu;
