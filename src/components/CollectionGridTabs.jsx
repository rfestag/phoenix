import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import _ from "lodash";
import Grid from "./Grid";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";

export class CollectionGridTabs extends React.Component {
  static propTypes = {
    collections: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: Object.keys(this.props.collections)[0]
    };
  }
  componentDidUpdate(prevProps, prevState) {
    //Check to see if the activeTab is invalid (the collection was removed)
    const collections = Object.keys(this.props.collections);
    if (!_.includes(collections, this.state.activeTab)) {
      const oldCollections = Object.keys(prevProps.collections);
      //If it was, and it wasn't the first tab, set it to the tab before the deleted tab
      //Otherwise, set it to the tab after the deleted tab (which would result in undefined if no such tab)
      let i = oldCollections.indexOf(this.state.activeTab);
      if (i > 0) {
        this.setState({ activeTab: oldCollections[i - 1] });
      } else {
        this.setState({ activeTab: oldCollections[i + 1] });
      }
    }
  }
  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Nav tabs style={{ height: "42px" }}>
          {_.map(this.props.collections, (collection, id) => (
            <NavItem key={id}>
              <NavLink
                className={classnames({ active: this.state.activeTab === id })}
                onClick={() => {
                  this.toggle(id);
                }}
              >
                {collection.name}
              </NavLink>
            </NavItem>
          ))}
        </Nav>
        <TabContent activeTab={this.state.activeTab} style={{ flex: "1" }}>
          {_.map(this.props.collections, (collection, id) => (
            <TabPane tabId={id} key={id} style={{ height: "100%" }}>
              <Grid collectionId={id} collection={collection} />
            </TabPane>
          ))}
        </TabContent>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    collections: state.collection.collections
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionGridTabs);
