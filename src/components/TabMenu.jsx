import React from "react";
import PropTypes from "prop-types";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { deleteCollection } from "../modules/collection//CollectionActions";

const defaultHandler = (action, item) => () => {
  console.log(action, item);
};
export const TabMenu = ({
  children,
  active,
  item,
  onManageClicked = defaultHandler,
  onColorClicked = defaultHandler,
  onDeleteClicked
}) => (
  <Dropdown style={{ display: "flex" }}>
    {children}
    <DropdownToggle
      color={active ? "accent" : "secondary"}
      style={{
        flex: "unset",
        padding: 0,
        margin: "0 .25rem 0 0",
        transition: "none"
      }}
      caret
    />
    <DropdownMenu
      right
      modifiers={{ preventOverflow: { boundariesElement: "window" } }}
      positionFixed={true}
    >
      <DropdownItem onClick={onManageClicked("manage", item)}>
        Manage...
      </DropdownItem>
      <DropdownItem onClick={onColorClicked("color", item)}>
        Set Color
      </DropdownItem>
      <DropdownItem onClick={() => onDeleteClicked(item.id)}>
        Delete
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

TabMenu.propTypes = {
  active: PropTypes.bool,
  item: PropTypes.any,
  children: PropTypes.any,
  onManageClicked: PropTypes.func,
  onColorClicked: PropTypes.func,
  onDeleteClicked: PropTypes.func
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onDeleteClicked: deleteCollection
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(TabMenu);
