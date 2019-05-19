import { WMSTileLayer, TileLayer, GeoJSON } from "react-leaflet";
import { LayerGroup } from "./LayerGroup";

export const WMS = "WMS";
export const TILE = "Tile";
export const GEOJSON = "GeoJSON";
export const GROUP = "Group";

export const LAYER_TYPE_MAP = {
  [WMS]: WMSTileLayer,
  [TILE]: TileLayer,
  [GEOJSON]: GeoJSON,
  [GROUP]: LayerGroup
};
