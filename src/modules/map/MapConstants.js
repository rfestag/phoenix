import { WMSTileLayer, TileLayer } from "react-leaflet";
import { LayerGroup } from "./LayerGroup";

export const WMS = "WMS";
export const TILE = "Tile";
export const GROUP = "Group";

export const LAYER_TYPE_MAP = {
  [WMS]: WMSTileLayer,
  [TILE]: TileLayer,
  [GROUP]: LayerGroup
};
