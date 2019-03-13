import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import Map2D from "../modules/map/Map2D";
import ErrorBoundary from "./ErrorBoundary";
import CollectionGridTabs from "./CollectionGridTabs";
import { connect } from "react-redux";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import {
  LEFT_PANEL,
  RIGHT_PANEL,
  BOTTOM_PANEL
} from "../modules/panel/PanelActions";

const Wrapper = styled.div`
  flex: 1 1;
  min-width: 0;
`;

const MainPanels = ({ leftPane, rightPane, bottomPane }) => (
  <Wrapper>
    <ReflexContainer orientation="vertical">
      {leftPane && (
        <ReflexElement key="left" maxSize={400} threshold={40}>
          <LeftPanel activePane={leftPane} />
        </ReflexElement>
      )}
      {leftPane && <ReflexSplitter propogate={true} />}
      <ReflexElement key="main">
        <ReflexContainer orientation="horizontal">
          <ReflexElement key="map" minSize={100}>
            <ErrorBoundary>
              <Map2D />
            </ErrorBoundary>
          </ReflexElement>
          {bottomPane && <ReflexSplitter propagate={true} />}
          {bottomPane && (
            <ReflexElement key="bottom" maxSize={500} threshold={60}>
              <CollectionGridTabs />
            </ReflexElement>
          )}
        </ReflexContainer>
      </ReflexElement>
      {rightPane && <ReflexSplitter propagate={true} />}
      {rightPane && (
        <ReflexElement key="right" maxSize={400} threshold={60}>
          <RightPanel activePane={rightPane} />
        </ReflexElement>
      )}
    </ReflexContainer>
  </Wrapper>
);

MainPanels.propTypes = {
  leftPane: PropTypes.string,
  rightPane: PropTypes.string,
  bottomPane: PropTypes.string
};

function mapStateToProps(state, props) {
  return {
    leftPane: state.panel[LEFT_PANEL],
    rightPane: state.panel[RIGHT_PANEL],
    bottomPane: state.panel[BOTTOM_PANEL]
  };
}

export default connect(mapStateToProps, null)(MainPanels);
