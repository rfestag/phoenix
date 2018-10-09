import "proj4";
import "proj4leaflet";
import L from "leaflet";

import {
  SET_PROJECTION,
  SET_BASELAYER,
  ADD_BASELAYER,
  REMOVE_BASELAYER,
  SHOW_OVERLAY,
  HIDE_OVERLAY,
  ADD_OVERLAY,
  REMOVE_OVERLAY
} from "./MapActions";

const pixel_ratio = parseInt(window.devicePixelRatio, 10) || 1;

const max_zoom = 16;
const tile_size = 512;

const extent = Math.sqrt(2) * 6371007.2;
const resolutions = Array(max_zoom + 1)
  .fill()
  .map((_, i) => extent / tile_size / Math.pow(2, i - 1));

const polar = new L.Proj.CRS(
  "EPSG:3575",
  "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs",
  {
    origin: [-extent, extent],
    projectedBounds: L.bounds(
      L.point(-extent, extent),
      L.point(extent, -extent)
    ),
    resolutions: resolutions
  }
);
const projections = [
  {
    name: "Web Mercator",
    projection: "EPSG:3857",
    crs: L.CRS.EPSG3857,
    settings: { center: [0, 0], minZoom: 0, maxZoom: 16 }
  },
  {
    name: "Arctic LAEA on 10°E",
    projection: "ESPG:3575",
    crs: polar,
    settings: { center: [87, 87], minZoom: 2, maxZoom: 16 }
  }
];
let baseLayers = [
  {
    name: "Night",
    projection: "EPSG:3857",
    type: "tile",
    settings: {
      zoomOffset: -1,
      tileSize: 512,
      url:
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png"
    }
  },
  {
    name: "World Imagery",
    projection: "EPSG:3857",
    type: "tile",
    settings: {
      tileSize: 512,
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    }
  },
  {
    name: "Gray Canvas",
    projection: "EPSG:3857",
    type: "tile",
    settings: {
      tileSize: 512,
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    }
  },
  {
    name: "Earth at Night",
    projection: "EPSG:3857",
    type: "tile",
    settings: {
      tileSize: 512,
      url:
        "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}"
    }
  },
  {
    name: "Open Street Map",
    projection: "EPSG:3857",
    type: "tile",
    settings: {
      maxZoom: 19,
      tileSize: 512,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    }
  },
  {
    name: "Polar",
    projection: "ESPG:3575",
    type: "tile",
    settings: {
      tileSize: 512,
      url: "https://tile.gbif.org/3575/omt/{z}/{x}/{y}@{r}x.png?style=gbif-classic".replace(
        "{r}",
        pixel_ratio
      )
    }
  }
];
let overlays = [];

const initialState = {
  baseLayers,
  center: projections[0].settings.center,
  crs: projections[0],
  layer: baseLayers[0],
  overlays,
  projections,
  zoom: 5
};
export default function(state = initialState, action) {
  /* TODO: Implement above actions */
  let idx = -1;
  switch (action.type) {
    case SET_PROJECTION:
      return { ...state, crs: action.projection };
    case SET_BASELAYER:
      if (state.crs.projection === action.layer.projection) {
        return { ...state, layer: action.layer };
      } else {
        let projection = state.projections.find(p => p === action.projection);
        return {
          ...state,
          center: projection.settings.center,
          layer: action.layer,
          crs: projection
        };
      }
    case ADD_BASELAYER:
      return { ...state, baseLayers: [...state.baseLayers, action.layer] };
    case ADD_OVERLAY:
      return { ...state, overlays: [...state.overlays, action.layer] };
    case REMOVE_BASELAYER:
      const oldLayers = state.baseLayers;
      idx = oldLayers.indexOf(action.layer);
      if (idx >= 0)
        return {
          ...state,
          baseLayers: [...oldLayers.slice(0, idx), ...oldLayers.slice(idx + 1)]
        };
      return state;
    case REMOVE_OVERLAY:
      const oldOverlays = state.overlays;
      idx = oldOverlays.indexOf(action.layer);
      if (idx >= 0)
        return {
          ...state,
          overlays: [
            ...oldOverlays.slice(0, idx),
            ...oldOverlays.slice(idx + 1)
          ]
        };
      return state;
    case SHOW_OVERLAY:
      return state;
    case HIDE_OVERLAY:
      return state;
    default:
      return state;
  }
}
