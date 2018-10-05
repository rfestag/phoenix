import React from "react";
import MetricsTable from "../modules/metrics/MetricsTable";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import ReactModal from "react-modal-resizable-draggable";
import Dialog from "./Dialog";

class AdminMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMetrics: false
    };
    //this.setState({showMetrics: false})
  }
  toggle = () => {
    console.log("Toggling state", this.state);
    this.setState({ showMetrics: !this.state.showMetrics });
  };
  close = () => {
    this.setState({ showMetrics: false });
  };
  render() {
    return (
      <div>
        <Dropdown setActiveFromChild>
          <DropdownToggle caret>Admin</DropdownToggle>
          <DropdownMenu right={true}>
            <DropdownItem onClick={this.toggle}>Metrics</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <ReactModal
          initWidth={800}
          initHeight={200}
          onRequestClose={this.close}
          isOpen={this.state.showMetrics}
        >
          <Dialog title="Performance Metrics" onClose={this.close}>
            <MetricsTable />
          </Dialog>
        </ReactModal>
      </div>
    );
  }
}

export default AdminMenu;
