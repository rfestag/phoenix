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

/*
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
*/

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
const Tab = styled(NavItem)`
  flex: 0 1;
  max-width: 250px;
  min-width: 100px;
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

    this.state = {
      activeTab: 0,
      position: 0,
      sliding: false
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
    return (
      this.state.position === Object.keys(this.props.collections).length - 1
    );
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
  render() {
    return (
      <OuterPanel>
        <TabCarousel>
          <Button disabled={this.prevDisabled()} onClick={this.prevTab}>
            <ChevronLeftIcon />
          </Button>
          <Tabs tabs>
            {_.map(this.props.collections, (collection, id) => (
              <Tab key={id} order={this.getOrder(id)}>
                <NavLink
                  className={classnames({
                    active: this.props.activeTab === id
                  })}
                  style={{ padding: ".5rem 0 .5rem 1rem" }}
                >
                  <TabMenu
                    item={collection}
                    active={this.props.activeTab === id}
                    onMenuAction={this.onMenuAction}
                  >
                    <span
                      onClick={() => {
                        this.props.onTabChange(id);
                      }}
                    >
                      {collection.name}
                    </span>
                  </TabMenu>
                </NavLink>
              </Tab>
            ))}
          </Tabs>
          <Button disabled={this.nextDisabled()} onClick={this.nextTab}>
            <ChevronRightIcon />
          </Button>
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
        <TabContent activeTab={this.props.activeTab} style={{ flex: "1" }}>
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
