import "proj4";
import "proj4leaflet";
import L from "leaflet";
import { of } from "rxjs/observable/of";
import { withLatestFrom } from "rxjs/operators";
import { ofType } from "redux-observable";
import {
  setMapState,
  SET_VIEWPORT,
  SET_ZOOM,
  SET_CENTER,
  SET_BOUNDS,
  SET_PROJECTION,
  SET_BASELAYER,
  ADD_BASELAYER,
  REMOVE_BASELAYER,
  SHOW_OVERLAY,
  HIDE_OVERLAY,
  ADD_OVERLAY,
  REMOVE_OVERLAY
} from "./MapActions";

const MAP_ACTIONS = [
  SET_VIEWPORT,
  SET_ZOOM,
  SET_CENTER,
  SET_BOUNDS,
  SET_PROJECTION,
  SET_BASELAYER,
  ADD_BASELAYER,
  REMOVE_BASELAYER,
  SHOW_OVERLAY,
  HIDE_OVERLAY,
  ADD_OVERLAY,
  REMOVE_OVERLAY
];

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
    settings: { worldCopyJump: true, center: [0, 0], minZoom: 2, maxZoom: 16 }
  },
  {
    name: "Arctic LAEA on 10°E",
    projection: "ESPG:3575",
    crs: polar,
    settings: {
      worldCopyJump: false,
      center: [87, 87],
      minZoom: 2,
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
      zoomOffset: -1,
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
      zoomOffset: -1,
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
      zoomOffset: -1,
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
      zoomOffset: 0,
      tileSize: 512,
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

const DEFAULT_STATE = {
  baseLayers,
  center: projections[0].settings.center,
  crs: projections[0],
  layer: baseLayers[0],
  overlays,
  projections,
  zoom: 3
};

export const manageMapState = (action$, state$) => {
  let settings, savedState;

  //We should wrap this in a try-catch to protect against any issues with
  //messed up local state. If we ever fail to pull settings form local storage,
  //simply revert to defaults.
  try {
    settings = localStorage.getItem("map");
    savedState = settings ? JSON.parse(settings) : DEFAULT_STATE;
  } catch (e) {
    savedState = DEFAULT_STATE;
  }
  savedState.crs = projections.find(p => p.name === savedState.crs.name);
  savedState.projections = projections;
  savedState.pannable = true;

  //This will, out of band, update settings in local storage
  action$
    .pipe(ofType(...MAP_ACTIONS), withLatestFrom(state$))
    .subscribe(([, state]) => {
      localStorage.setItem("map", JSON.stringify(state.map));
    });

  //When the epic starts, overwrite library defaults with local storage.
  return of(setMapState(savedState));
};
