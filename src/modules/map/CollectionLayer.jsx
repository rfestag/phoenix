import { GridLayer, withLeaflet } from "react-leaflet";
import { GridLayer as LeafletGridLayer } from "leaflet";
import { Stage, Line, Circle, FastLayer } from "konva";
import * as Util from "leaflet/src/core/Util";
import _ from "lodash";

function shouldDraw(bbox, bounds) {
  //minlon, minlat, maxlon, maxlat
  if (bbox[0] > bounds._northEast.lng) return false; // box is east of tile
  if (bbox[2] > bounds._northEast.lat) return false; // box is north of tile
  if (bbox[1] < bounds._southWest.lng) return false; // box is west of tile
  if (bbox[3] < bounds._southWest.lat) return false; // box is south of tile
  return true; // boxes overlap
}

export const CollectionLayer = LeafletGridLayer.extend({
  options: {
    tileSize: 256
  },
  initialize: function(collection, props) {
    Util.setOptions(this, props);
    this.collection = collection;
    this.stages = new Map();
    this.on("tileunload", e => {
      const stage = this.stages[e.coords];
      if (stage) {
        this.stages.delete(e.coords);
        stage.destroy();
      } else console.log("No stage for", e.coords);
    });
  },
  renderLine: function(geom, layer, x, y) {
    let shape = new Line();
    shape.shadowForStrokeEnabled(false);
    layer.add(shape);
    const points = geom.coordinates.reduce((pts, p) => {
      const pt = this._map.project([p[1], p[0]], this._tileZoom);
      pts.push(Math.floor(pt.x - x));
      pts.push(Math.floor(pt.y - y));
      return pts;
    }, []);
    shape.points(points);
    shape.stroke("red");
    shape.strokeWidth(2);
    layer.add(shape);
  },
  renderPoint: function(geom, layer, x, y) {
    const p = [geom.coordinates[1], geom.coordinates[0]];
    const pt = this._map.project(p, this._tileZoom);
    let shape = new Circle({
      radius: 2,
      x: Math.floor(pt.x - x),
      y: Math.floor(pt.y - y)
    });
    shape.shadowForStrokeEnabled(false);
    shape.fill("red");
    shape.strokeWidth(0);
    layer.add(shape);
  },
  renderStage: function(stage, coords, tileBounds) {
    //const tilePixelBounds = this._getTiledPixelBounds();
    //const x = tilePixelBounds.min.x;
    //const y = tilePixelBounds.min.y;
    const x = coords.x * this._tileSize.x;
    const y = coords.y * this._tileSize.y;
    //const z = coords.z;
    const layer = stage.getLayers()[0];

    if (!layer || !tileBounds) return;
    //console.time("Computing shapes");
    _.each(this.collection.data, (entity, id) => {
      _.each(entity.geometries, (geometryCollection, field) => {
        _.each(geometryCollection.geometries, geom => {
          if (geom && geom.bbox && shouldDraw(geom.bbox, tileBounds)) {
            if (geom.type === "Point") {
              this.renderPoint(geom, layer, x, y);
            } else if (geom.etype === "Track") {
              this.renderLine(geom, layer, x, y);
            }
          }
        });
      });
    });
    //console.timeEnd("Computing shapes");
    //console.time("Drawing");
    layer.batchDraw();
    //console.timeEnd("Drawing");
  },
  createTile: function(coords) {
    const tile = document.createElement("div");
    const tileSize = this.getTileSize();
    const stage = new Stage({
      container: tile,
      width: tileSize.x,
      height: tileSize.y
    });
    const bounds = this._tileCoordsToBounds(coords);
    const layer = new FastLayer();
    stage.add(layer);
    this.stages[coords] = stage;
    this.renderStage(stage, coords, bounds);
    return tile;
  }
});

class ReactCollectionLayer extends GridLayer {
  createLeafletElement(props) {
    this.redraw = _.throttle(() => this.leafletElement.redraw(), 8000);
    return new CollectionLayer(props.collection.data, this.getOptions(props));
  }
  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (this.leafletElement.collection !== toProps.collection) {
      this.leafletElement.collection = toProps.collection;
      this.redraw();
    }
  }
}

export default withLeaflet(ReactCollectionLayer);
