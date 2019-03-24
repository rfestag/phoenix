import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import _ from "lodash";
import Grid from "./Grid";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import styled from "styled-components";
import { setCurrentCollection } from "../modules/collection/CollectionActions";
import { ChevronLeftIcon, ChevronRightIcon, ColumnsIcon } from "./Icons";
import { Button } from "reactstrap";
import {
  RIGHT_PANEL,
  COLUMN_PANE,
  toggleColumnPane
} from "../modules/panel/PanelActions";
import TabMenu from "./TabMenu";
import ReactResizeDetector from "react-resize-detector";

/*
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
*/

const MAX_TAB_WIDTH_PCT = 13;
const MAX_TAB_WIDTH = 150;

const OuterPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TabCarousel = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${props => props.theme.secondary};
`;

const Tabs = styled(Nav)`
  align-content: flex-start;
  flex: 1;
  height: 42px;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;
const fadeColor = ({ active, theme }) =>
  active ? theme.accentColor : theme.secondary;
const TabTitle = styled.span`
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  &:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 30%;
    height: 100%;
    background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      ${props => fadeColor(props)} 80%,
      ${props => fadeColor(props)} 100%
    );
    pointer-events: none;
  }
`;
const Tab = styled(NavItem)`
  flex: 0 1;
  width: ${MAX_TAB_WIDTH_PCT}%;
  min-width: ${MAX_TAB_WIDTH}px;
  order: ${props => props.order};
  display: ${props => (props.order < 0 ? "none" : "")};
`;

export class CollectionGridTabs extends React.Component {
  static propTypes = {
    collections: PropTypes.object.isRequired,
    activeTab: PropTypes.string,
    columnPaneActive: PropTypes.bool,
    onTabChange: PropTypes.func,
    onColumManagerClicked: PropTypes.func
  };
  constructor(props) {
    super(props);

    this.tabsRef = React.createRef();
    this.state = {
      activeTab: 0,
      position: 0,
      sliding: false,
      maxTabs: Math.floor(100 / MAX_TAB_WIDTH_PCT)
    };
  }
  getOrder(id) {
    const collections = Object.keys(this.props.collections);
    const itemIndex = collections.indexOf(id);
    const { position } = this.state;
    return itemIndex - position;
  }
  prevDisabled = () => {
    return this.state.position === 0;
  };
  nextDisabled = () => {
    const count = Object.keys(this.props.collections).length;
    return count - this.state.position <= this.state.maxTabs;
  };
  nextTab = () => {
    const { position } = this.state;
    const collections = Object.keys(this.props.collections);
    const numItems = collections.length || 1;

    if (position !== numItems - 1) {
      this.setState({ position: position + 1 });
    }
  };
  prevTab = () => {
    const { position } = this.state;

    if (position !== 0) {
      this.setState({ position: position - 1 });
    }
  };
  onMenuAction = action => {
    console.log("TODO: Handle", action);
  };
  handleChange = (event, activeTab) => {
    const collections = Object.keys(this.props.collections);
    this.props.onTabChange(collections[activeTab]);
    this.setState({ activeTab });
  };
  calcTabs = size => {
    let maxTabs = Math.floor(size / MAX_TAB_WIDTH);
    if (maxTabs / 100 > MAX_TAB_WIDTH_PCT)
      maxTabs = Math.floor(100 / MAX_TAB_WIDTH_PCT);
    this.setState({ maxTabs });
  };
  render() {
    return (
      <OuterPanel>
        <TabCarousel>
          {!this.prevDisabled() && (
            <Button disabled={this.prevDisabled()} onClick={this.prevTab}>
              <ChevronLeftIcon />
            </Button>
          )}
          <ReactResizeDetector handleWidth onResize={this.calcTabs}>
            <Tabs tabs ref={this.tabsRef}>
              {_.map(this.props.collections, (collection, id) => (
                <Tab key={id} order={this.getOrder(id)}>
                  <NavLink
                    className={classnames({
                      active: this.props.activeTab === id
                    })}
                    style={{ padding: "0.5rem 0 0 0.5rem", lineHeight: 2 }}
                  >
                    <TabMenu
                      item={collection}
                      active={this.props.activeTab === id}
                      onMenuAction={this.onMenuAction}
                    >
                      <TabTitle
                        title={collection.name}
                        active={this.props.activeTab === id}
                        onClick={() => {
                          this.props.onTabChange(id);
                        }}
                      >
                        {collection.name}
                      </TabTitle>
                    </TabMenu>
                  </NavLink>
                </Tab>
              ))}
            </Tabs>
          </ReactResizeDetector>
          {!this.nextDisabled() && (
            <Button disabled={this.nextDisabled()} onClick={this.nextTab}>
              <ChevronRightIcon />
            </Button>
          )}
          <Button
            active={this.props.columnPaneActive}
            onClick={this.props.onColumManagerClicked}
          >
            <ColumnsIcon />
          </Button>
        </TabCarousel>
        {/*
        <AppBar position="static" color="default" style={{zIndex: 0, flexDirection: 'row', display: 'flex'}}>
          <Tabs
            value={this.state.activeTab}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            style={{flex: 1}}
          >
            {_.map(this.props.collections, (collection, id) => (
              <Tab key={id} label={collection.name} />
            ))}
          </Tabs>
          <Button
            active={this.props.columnPaneActive}
            onClick={this.props.onColumManagerClicked}
          >
            <ColumnsIcon />
          </Button>
        </AppBar>
        */}
        <TabContent
          activeTab={this.props.activeTab}
          style={{ flex: "1", overflow: "hidden" }}
        >
          <TabPane tabId={this.props.activeTab} style={{ height: "100%" }}>
            <Grid
              collectionId={this.props.activeTab}
              collection={this.props.collections[this.props.activeTab] || {}}
            />
          </TabPane>
        </TabContent>
      </OuterPanel>
    );
  }
}
function mapStateToProps(state) {
  return {
    columnPaneActive: state.panel[RIGHT_PANEL] === COLUMN_PANE,
    activeTab: state.collection.current,
    collections: state.collection.collections
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onTabChange: setCurrentCollection,
      onColumManagerClicked: toggleColumnPane
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionGridTabs);
