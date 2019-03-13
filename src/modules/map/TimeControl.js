import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Draggable from "react-draggable";
import { DomEvent, Browser } from "leaflet";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { enablePanning, disablePanning } from "./MapActions";

const Wrapper = styled.div`
  width: 500px;
  height: 96px;
  border-radius: 0 10px 0 0;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 500;
  transition: background-color 200ms linear;
  opacity: 0.3;
  &:hover {
    background-color: ${props => props.theme.mapControlBg};
    opacity: 1;
  }
`;

const TimeSlider = styled.div`
  height: 100%;
  width: calc(100% - 20px);
  left: 10px;
  position: relative;
`;
const Handle = styled.div`
  width: 12px;
  height: 12px;
  border: 1px solid white;
  border-radius: 12px;
  background-color: ${props => props.theme.accentColor};
  position: absolute;
  bottom: 12px;
  &:hover {
    cursor: pointer;
  }
`;
const DraggableHandle = opts => (
  <Draggable bounds="parent" axis="x" {...opts}>
    <Handle />
  </Draggable>
);
const Rail = styled.div`
  width: calc(100% - 10px);
  height: 6px;
  bottom: 15px;
  left: 5px;
  border: 1px solid ${props => props.theme.secondary};
  border-radius: 5px;
  background-color: black;
  position: absolute;
`;

class TimeControl extends React.Component {
  constructor(props) {
    super(props);
    this.container = React.createRef();
  }
  componentDidMount() {
    if (!Browser.touch) {
      console.log("Disable click prop");
      DomEvent.disableClickPropagation(this.container.current);
      DomEvent.on(
        this.container.current,
        "mousewheel",
        DomEvent.stopPropagation
      );
    } else {
      console.log("Stop prop on click");
      DomEvent.on(this.container.current, "click", DomEvent.stopPropagation);
    }
  }
  render() {
    return (
      <Wrapper
        ref={this.container}
        onMouseEnter={this.props.disablePanning}
        onMouseLeave={this.props.enablePanning}
      >
        <TimeSlider>
          <Rail />
          <DraggableHandle />
          <DraggableHandle />
        </TimeSlider>
      </Wrapper>
    );
  }
}
TimeControl.propTypes = {
  children: PropTypes.any,
  disablePanning: PropTypes.func,
  enablePanning: PropTypes.func
};

function mapStateToProps(state, props) {
  //Only map subset of state that map actually requires for rendering
  return {
    pannable: state.map.pannable
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      enablePanning,
      disablePanning
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeControl);
