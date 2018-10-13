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
    settings: { worldCopyJump: true, center: [0, 0], minZoom: 1, maxZoom: 16 }
  },
  {
    name: "Arctic LAEA on 10°E",
    projection: "ESPG:3575",
    crs: polar,
    settings: {
      worldCopyJump: false,
      center: [87, 87],
      minZoom: 1,
      maxZoom: 16
    }
  }
];
let baseLayers = [
  {
    name: "Night",
    projection: "EPSG:3857",
    type: "tile",
    active: true,
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
    active: false,
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
    active: false,
    settings: {
      tileSize: 512,
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    }
  },
  {
    name: "Open Street Map",
    projection: "EPSG:3857",
    type: "tile",
    active: false,
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
    active: false,
    settings: {
      tileSize: 512,
      maxZoom: 16,
      url: "https://tile.gbif.org/3575/omt/{z}/{x}/{y}@{r}x.png?style=gbif-classic".replace(
        "{r}",
        pixel_ratio
      )
    }
  }
];

let overlays = [
  {
    name: "Open Weather Map - Clouds",
    projection: "EPSG:3857",
    type: "tile",
    active: false,
    settings: {
      apiKey: "586a2c891fc0b7bed36e2b2425199e21",
      opacity: 0.5,
      url:
        "https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={apiKey}"
    }
  },
  {
    name: "Open Weather Map - Precipitation",
    projection: "EPSG:3857",
    type: "tile",
    active: false,
    settings: {
      apiKey: "586a2c891fc0b7bed36e2b2425199e21",
      opacity: 0.5,
      url:
        "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={apiKey}"
    }
  },
  {
    name: "Open Weather Map - Pressure",
    projection: "EPSG:3857",
    type: "tile",
    active: false,
    settings: {
      apiKey: "586a2c891fc0b7bed36e2b2425199e21",
      opacity: 0.5,
      url:
        "https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid={apiKey}"
    }
  },
  {
    name: "Open Weather Map - Temperature",
    projection: "EPSG:3857",
    type: "tile",
    active: false,
    settings: {
      apiKey: "586a2c891fc0b7bed36e2b2425199e21",
      opacity: 0.5,
      url:
        "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={apiKey}"
    }
  },
  {
    name: "Open Weather Map - Wind",
    projection: "EPSG:3857",
    type: "tile",
    active: false,
    settings: {
      apiKey: "586a2c891fc0b7bed36e2b2425199e21",
      opacity: 0.5,
      url:
        "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={apiKey}"
    }
  }
];

const initialState = {
  baseLayers,
  center: projections[0].settings.center,
  crs: projections[0],
  layer: baseLayers[0],
  overlays,
  projections,
  zoom: 3
};
function updateLayer(layers, layer, update) {
  let idx = layers.indexOf(layer);
  if (idx) {
    layers[idx] = { ...layer, ...update };
  }
  return layers;
}
function setActiveBaselayer(layers, layer) {
  let oldIndex = layers.findIndex(l => l.active);
  let newIndex = layers.findIndex(l => l === layer);
  console.log(oldIndex, newIndex);
  if (oldIndex < 0 || newIndex < 0) return layers;
  layers = [...layers];
  layers[oldIndex] = { ...layers[oldIndex], active: false };
  layers[newIndex] = { ...layers[newIndex], active: true };
  return layers;
}
function setActiveOverlays(layers, layer, active) {
  let idx = layers.findIndex(l => l === layer);
  if (idx < 0) return layers;
  layer = { ...layer, active };
  layers[idx] = layer;
  return layers;
}
export default function(state = initialState, action) {
  /* TODO: Implement above actions */
  let idx = -1;
  let baseLayers;
  let overlays;
  switch (action.type) {
    case SET_PROJECTION:
      return { ...state, crs: action.projection };
    case SET_BASELAYER:
      if (action.layer === state.layer) return state; //No change
      if (state.crs.projection === action.layer.projection) {
        baseLayers = setActiveBaselayer(state.baseLayers, action.layer);
        if (baseLayers === state.baseLayers) return state; //No change
        console.log("New base layers", baseLayers);
        return { ...state, baseLayers, layer: action.layer };
      } else {
        let projection = state.projections.find(
          p => p.projection === action.layer.projection
        );
        baseLayers = setActiveBaselayer(state.baseLayers, action.layer);
        if (baseLayers === state.baseLayers) return state; //No change
        console.log("New base layers", baseLayers, projection);
        return {
          ...state,
          baseLayers,
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
      overlays = [...setActiveOverlays(state.overlays, action.layer, true)];
      return { ...state, overlays };
    case HIDE_OVERLAY:
      overlays = [...setActiveOverlays(state.overlays, action.layer, false)];
      return { ...state, overlays };
    default:
      return state;
  }
}
