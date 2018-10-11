import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Map, Rectangle } from "react-leaflet";

const Wrapper = styled.div`
  width: 170px;
  height: 170px;
  z-index: 600;
  position: absolute;
  bottom: 0;
  right: 0;
  margin-right: 60px;
  margin-bottom: 12px;
  border: solid 5px white;
  display: ${props => (props.active ? "" : "none")};
`;

class MiniMap extends Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
  }

  static propTypes = {
    active: PropTypes.bool,
    crs: PropTypes.object,
    center: PropTypes.array,
    zoom: PropTypes.zoom,
    bounds: PropTypes.object,
    children: PropTypes.array,
    minZoom: PropTypes.number
  };

  componentDidMount() {
    const map = this.map.current.leafletElement;
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      this.resize();
    }
  }
  resize() {
    const map = this.map.current.leafletElement;
    if (map) {
      map.invalidateSize();
    }
  }

  render() {
    const {
      active,
      crs,
      center,
      zoom,
      bounds,
      children,
      minZoom = 1
    } = this.props;
    return (
      <Wrapper active={active}>
        <Map
          ref={this.map}
          crs={crs}
          zoomControl={false}
          attributionControl={false}
          center={center}
          zoom={zoom}
          style={{ width: "100%", height: "100%" }}
          minZoom={minZoom}
        >
          {children}
          {bounds && zoom >= minZoom && <Rectangle bounds={bounds} />}
        </Map>
      </Wrapper>
    );
  }
}
export default MiniMap;
