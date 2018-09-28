import React, { Component } from "react";
import { connect } from "react-redux";
import fontawesome from "@fortawesome/fontawesome";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import brands from "@fortawesome/fontawesome-free-brands";
import search from "@fortawesome/fontawesome-free-solid/faSearch";
import rss from "@fortawesome/fontawesome-free-solid/faRss";
import chart from "@fortawesome/fontawesome-free-solid/faChartBar";
import cancel from "@fortawesome/fontawesome-free-solid/faTimes";
import pause from "@fortawesome/fontawesome-free-solid/faPause";
import play from "@fortawesome/fontawesome-free-solid/faPlay";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import CollapsibleElement from "./modules/panel/CollapsibleElement";
import ErrorBoundary from "./components/ErrorBoundary";
import Map2D from "./modules/map/Map2D";
import CollectionGridTabs from "./components/CollectionGridTabs";
import { togglePanel, collapsePanel } from "./modules/panel/PanelActions";
import {
  createQuery,
  cancelQuery,
  startQuery,
  stopQuery
} from "./modules/query/QueryActions";
import { ButtonGroup } from "reactstrap";
import styled from "styled-components";
import PropTypes from "prop-types";
import Banner from "./components/Banner";
import TopMenu from "./components/TopMenu";
import LeftMenu from "./components/LeftMenu";
import LeftMenuBarButton from "./components/LeftMenuBarButton";
import ColumnManager from "./modules/columns/ColumManager";
import SettingsMenu from "./components/SettingsMenu";
import HelpMenu from "./components/HelpMenu";

fontawesome.library.add(search, rss, chart, brands, cancel, pause, play);

const Outer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  width: 100%;
`;
const Main = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;
const Content = styled.div`
  flex: 1 1;
`;
const Brand = styled(FontAwesomeIcon)`
  color: ${props => props.theme.accentColor};
`;

function mapStateToProps(state) {
  return {
    panel: state.panel,
    query: state.query,
    map: state.map
  };
}
function mapDispatchToProps(dispatch) {
  return {
    toggleLeft: () => dispatch(togglePanel("left")),
    toggleRight: () => dispatch(togglePanel("right")),
    toggleBottom: () => dispatch(togglePanel("bottom")),
    collapseLeft: () => dispatch(collapsePanel("left")),
    collapseRight: () => dispatch(collapsePanel("right")),
    collapseBottom: () => dispatch(collapsePanel("bottom")),
    createQuery: (src, query, name) => dispatch(createQuery(src, query, name)),
    cancelQuery: id => dispatch(cancelQuery(id)),
    startQuery: id => dispatch(startQuery(id)),
    stopQuery: id => dispatch(stopQuery(id))
  };
}

class App extends Component {
  static propTypes = {
    panel: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    toggleLeft: PropTypes.func.isRequired,
    toggleRight: PropTypes.func.isRequired,
    toggleBottom: PropTypes.func.isRequired,
    collapseLeft: PropTypes.func.isRequired,
    collapseRight: PropTypes.func.isRequired,
    collapseBottom: PropTypes.func.isRequired,
    createQuery: PropTypes.func.isRequired,
    cancelQuery: PropTypes.func.isRequired,
    startQuery: PropTypes.func.isRequired,
    stopQuery: PropTypes.func.isRequired
  };

  componentDidMount() {
    if (window.WebSocket) {
      this.props.createQuery("ADSBApollo", {}, "ADSB Exchange");
    }
  }
  startNewTest = () => {
    this.props.createQuery("Test", {});
  };
  toggleQuery() {
    const id = Object.keys(this.props.query)[0];
    console.log(this.props.query);
    if (id)
      this.props.query[id].paused
        ? this.props.startQuery(id)
        : this.props.stopQuery(id);
    else console.log("No queries", this.props.query);
  }
  id() {
    return Object.keys(this.props.query)[0];
  }

  onMapResize() {
    //this.map.resize();
  }
  cancelQuery() {
    console.log(this.props.query);
    const id = Object.keys(this.props.query)[0];
    console.log("Cancelling", id);
    this.props.cancelQuery(id);
  }

  render() {
    let id = Object.keys(this.props.query)[0];
    let icon = id ? (this.props.query[id].paused ? "play" : "pause") : null;
    return (
      <Outer>
        <Banner>Phoenix GIS</Banner>
        <TopMenu>
          <Brand
            icon={["fab", "phoenix-squadron"]}
            size="2x"
            className="icon-brand"
          />
          <ButtonGroup style={{ float: "right" }}>
            <HelpMenu />
            <SettingsMenu />
          </ButtonGroup>
        </TopMenu>
        <Main>
          <LeftMenu>
            <ButtonGroup vertical>
              <LeftMenuBarButton
                onClick={() => this.props.toggleLeft()}
                icon="search"
              />
              <LeftMenuBarButton
                onClick={() => this.props.toggleRight()}
                icon="rss"
              />
              <LeftMenuBarButton
                onClick={() => this.props.toggleBottom()}
                icon="chart-bar"
              />
              <LeftMenuBarButton
                onClick={() => this.cancelQuery()}
                icon="times"
              />
              {icon && (
                <LeftMenuBarButton
                  onClick={() => this.toggleQuery()}
                  icon={icon}
                />
              )}
            </ButtonGroup>
          </LeftMenu>
          <Content>
            <ReflexContainer orientation="vertical">
              {!this.props.panel.left && (
                <CollapsibleElement
                  className="left-pane"
                  onCollapse={() => this.props.collapseLeft()}
                  maxSize={400}
                  threshold={40}
                >
                  <button onClick={() => this.startNewTest()}>Start</button>
                </CollapsibleElement>
              )}
              {!this.props.panel.left && <ReflexSplitter propogate={true} />}
              <ReflexElement>
                <ReflexContainer orientation="horizontal">
                  <ReflexElement
                    minSize={100}
                    className="middle-pane"
                    onResize={this.onMapResize}
                  >
                    <ErrorBoundary>
                      <Map2D ref={this.map} />
                    </ErrorBoundary>
                  </ReflexElement>
                  {!this.props.panel.bottom && (
                    <ReflexSplitter propagate={true} />
                  )}
                  {!this.props.panel.bottom && (
                    <CollapsibleElement
                      className="bottom-pane"
                      onCollapse={() => this.props.collapseBottom()}
                      maxSize={500}
                      threshold={60}
                    >
                      <CollectionGridTabs />
                    </CollapsibleElement>
                  )}
                </ReflexContainer>
              </ReflexElement>
              {!this.props.panel.right && <ReflexSplitter propagate={true} />}
              {!this.props.panel.right && (
                <CollapsibleElement
                  className="right-pane"
                  onCollapse={() => this.props.collapseRight()}
                  maxSize={400}
                  threshold={60}
                >
                  <ColumnManager />
                </CollapsibleElement>
              )}
            </ReflexContainer>
          </Content>
        </Main>
        <Banner>
          Copyright &copy; 2018 Phoenix Project Team. All rights reserved
        </Banner>
      </Outer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
