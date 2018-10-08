import React, { Component } from "react";
import { connect } from "react-redux";
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faColumns,
  faFilter,
  faChartBar,
  faUser,
  faTimes,
  faPause,
  faPlay,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { faPhoenixSquadron } from "@fortawesome/free-brands-svg-icons";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import ErrorBoundary from "./components/ErrorBoundary";
import Map2D from "./modules/map/Map2D";
import CollectionGridTabs from "./components/CollectionGridTabs";
import {
  toggleQueryPane,
  toggleEntityPane,
  toggleFilterPane,
  toggleLayerPane,
  toggleGridPane
} from "./modules/panel/PanelActions";
import {
  createQuery,
  cancelQuery,
  resumeQuery,
  pauseQuery
} from "./modules/query/QueryActions";
import { ButtonGroup, Nav, NavItem } from "reactstrap";
import styled from "styled-components";
import PropTypes from "prop-types";
import Banner from "./components/Banner";
import TopMenu from "./components/TopMenu";
import LeftMenu from "./components/LeftMenu";
import LeftMenuBarButton from "./components/LeftMenuBarButton";
import SettingsMenu from "./components/SettingsMenu";
import AdminMenu from "./components/AdminMenu";
import HelpMenu from "./components/HelpMenu";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";

library.add(
  faSearch,
  faColumns,
  faFilter,
  faChartBar,
  faUser,
  faTimes,
  faPause,
  faPlay,
  faChevronLeft,
  faChevronRight,
  faPhoenixSquadron
);

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
    toggleQueryPane: () => dispatch(toggleQueryPane()),
    toggleEntityPane: () => dispatch(toggleEntityPane()),
    toggleFilterPane: () => dispatch(toggleFilterPane()),
    toggleLayerPane: () => dispatch(toggleLayerPane()),
    toggleGridPane: () => dispatch(toggleGridPane()),
    createQuery: (src, query, name) => dispatch(createQuery(src, query, name)),
    cancelQuery: id => dispatch(cancelQuery(id)),
    resumeQuery: id => dispatch(resumeQuery(id)),
    pauseQuery: id => dispatch(pauseQuery(id))
  };
}

class App extends Component {
  static propTypes = {
    panel: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    toggleQueryPane: PropTypes.func.isRequired,
    toggleEntityPane: PropTypes.func.isRequired,
    toggleFilterPane: PropTypes.func.isRequired,
    toggleLayerPane: PropTypes.func.isRequired,
    toggleGridPane: PropTypes.func.isRequired,
    createQuery: PropTypes.func.isRequired,
    cancelQuery: PropTypes.func.isRequired,
    resumeQuery: PropTypes.func.isRequired,
    pauseQuery: PropTypes.func.isRequired
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
        ? this.props.resumeQuery(id)
        : this.props.pauseQuery(id);
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
            <AdminMenu />
            <HelpMenu />
            <SettingsMenu />
          </ButtonGroup>
        </TopMenu>
        <Main>
          <LeftMenu>
            <Nav tabs>
              <NavItem style={{ width: "100%" }}>
                <LeftMenuBarButton
                  active={this.props.panel.LEFT === "QUERY"}
                  onClick={() => this.props.toggleQueryPane()}
                  icon="search"
                />
              </NavItem>
              <NavItem style={{ width: "100%" }}>
                <LeftMenuBarButton
                  active={this.props.panel.LEFT === "ENTITY"}
                  onClick={() => this.props.toggleEntityPane()}
                  icon="user"
                />
              </NavItem>
              <NavItem>
                <LeftMenuBarButton
                  active={this.props.panel.LEFT === "FILTER"}
                  onClick={() => this.props.toggleFilterPane()}
                  icon="filter"
                />
              </NavItem>
              <NavItem>
                <LeftMenuBarButton
                  onClick={() => this.props.toggleGridPane()}
                  icon="chart-bar"
                />
              </NavItem>
            </Nav>

            <ButtonGroup vertical>
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
              {this.props.panel.LEFT && (
                <ReflexElement maxSize={400} threshold={40}>
                  <LeftPanel activePane={this.props.panel.LEFT} />
                </ReflexElement>
              )}
              {this.props.panel.LEFT && <ReflexSplitter propogate={true} />}
              <ReflexElement>
                <ReflexContainer orientation="horizontal">
                  <ReflexElement minSize={100} onResize={this.onMapResize}>
                    <ErrorBoundary>
                      <Map2D ref={this.map} />
                    </ErrorBoundary>
                  </ReflexElement>
                  {this.props.panel.BOTTOM && (
                    <ReflexSplitter propagate={true} />
                  )}
                  {this.props.panel.BOTTOM && (
                    <ReflexElement maxSize={500} threshold={60}>
                      <CollectionGridTabs />
                    </ReflexElement>
                  )}
                </ReflexContainer>
              </ReflexElement>
              {this.props.panel.RIGHT && <ReflexSplitter propagate={true} />}
              {this.props.panel.RIGHT && (
                <ReflexElement maxSize={400} threshold={60}>
                  <RightPanel activePane={this.props.panel.RIGHT} />
                </ReflexElement>
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
