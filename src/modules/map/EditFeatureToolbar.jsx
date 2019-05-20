import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Input, Button, ButtonGroup } from "reactstrap";
import { DeleteIcon, EditIcon } from "../../components/Icons";

const ToolbarButton = styled(Button)`
  border: none !important;
`;

const test = e => {
  console.log("BOOM");
};
const EditFeatureToolbar = ({
  visible,
  position,
  editFeature,
  deleteFeature
}) => {
  return !visible ? null : (
    <ButtonGroup
      style={{
        position: "absolute",
        zIndex: 500,
        top: position.y,
        left: position.x
      }}
    >
      <ToolbarButton color="map-control" onClick={editFeature} title="Edit">
        <EditIcon />
      </ToolbarButton>
      <ToolbarButton
        color="map-control"
        onClick={deleteFeature}
        title="Remove from map"
      >
        <DeleteIcon />
      </ToolbarButton>
    </ButtonGroup>
  );
};
EditFeatureToolbar.propTypes = {
  visible: PropTypes.any,
  position: PropTypes.object,
  editFeature: PropTypes.func,
  deleteFeature: PropTypes.func
};

export default EditFeatureToolbar;
