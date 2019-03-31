import React from "react";
import PropTypes from "prop-types";
import { LAYER_TYPE_MAP } from "./MapConstants";
import { LayerGroup as LeafletLayerGroup } from "react-leaflet";

export const LayerGroup = ({ layer }) => {
  return (
    <LeafletLayerGroup>
      {layer.children.map(child => {
        const Layer = LAYER_TYPE_MAP[child.type];
        return <Layer key={child.name} {...child.settings} />;
      })}
    </LeafletLayerGroup>
  );
};
LayerGroup.propTypes = {
  layer: PropTypes.object
};
