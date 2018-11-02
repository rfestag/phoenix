import React, { Component } from "react";
import { connect } from "react-redux";
import { FaSearch, FaFilter, FaTh } from "react-icons/fa";
import { MdHourglassEmpty, MdList } from "react-icons/md";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import ErrorBoundary from "./components/ErrorBoundary";
import Map2D from "./modules/map/Map2D";
import CollectionGridTabs from "./components/CollectionGridTabs";
import SettingsModal from "./modules/settings/SettingsModal";
import {
  toggleQueryPane,
  toggleEntityPane,
  toggleFilterPane,
  toggleLayerPane,
  toggleGridPane
} from "./modules/panel/PanelActions";
import { createQuery } from "./modules/query/QueryActions";
import { Nav, NavItem } from "reactstrap";
import styled from "styled-components";
import PropTypes from "prop-types";
import Banner from "./components/Banner";
import TopMenu from "./components/TopMenu";
import LeftMenu from "./components/LeftMenu";
import LeftMenuBarButton from "./components/LeftMenuBarButton";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";

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
    createQuery: (src, query, name) => dispatch(createQuery(src, query, name))
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
    createQuery: PropTypes.func.isRequired
  };

  componentDidMount() {
    if (window.WebSocket) {
      this.props.createQuery("ADSBApollo", {}, "ADSB Exchange");
    }
  }

  render() {
    return (
      <Outer>
        <SettingsModal />
        <Banner>Phoenix GIS</Banner>
        <TopMenu />
        <Main>
          <LeftMenu>
            <Nav tabs style={{ position: "absolute", top: 0 }}>
              <NavItem>
                <LeftMenuBarButton
                  active={this.props.panel.LEFT === "QUERY"}
                  onClick={() => this.props.toggleQueryPane()}
                >
                  <FaSearch />
                </LeftMenuBarButton>
              </NavItem>
              <NavItem>
                <LeftMenuBarButton
                  active={this.props.panel.LEFT === "ENTITY"}
                  onClick={() => this.props.toggleEntityPane()}
                  icon="user"
                >
                  <MdList size="1.5em" />
                </LeftMenuBarButton>
              </NavItem>
              <NavItem>
                <LeftMenuBarButton
                  active={this.props.panel.LEFT === "FILTER"}
                  onClick={() => this.props.toggleFilterPane()}
                >
                  <FaFilter />
                </LeftMenuBarButton>
              </NavItem>
            </Nav>
            <Nav tabs style={{ position: "absolute", bottom: 0 }}>
              <NavItem>
                <LeftMenuBarButton
                  active={this.props.panel.BOTTOM === "GRID"}
                  onClick={() => this.props.toggleGridPane()}
                >
                  <MdHourglassEmpty size="1.5em" />
                </LeftMenuBarButton>
              </NavItem>
              <NavItem>
                <LeftMenuBarButton
                  active={this.props.panel.BOTTOM === "GRID"}
                  onClick={() => this.props.toggleGridPane()}
                >
                  <FaTh />
                </LeftMenuBarButton>
              </NavItem>
            </Nav>
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
                  <ReflexElement minSize={100}>
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
