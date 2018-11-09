import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import classnames from "classnames";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, Nav, NavItem } from "reactstrap";
import { FaSearch, FaFilter, FaTh } from "react-icons/fa";
import { MdHourglassEmpty, MdList } from "react-icons/md";
import {
  toggleQueryPane,
  toggleEntityPane,
  toggleFilterPane,
  toggleLayerPane,
  toggleGridPane
} from "../modules/panel/PanelActions";

const Wrapper = styled.div`
  width: 36px;
  flex: none;
  background-color: ${props => props.theme.menuBarBg};
`;
const StyledButton = styled.div`
  color: ${props => props.theme.buttonInactiveColor};
  height: 36px;
  width: 36px;
  position: relative;
  text-align: center;
  line-height: 50%;
  border: none;

  &:hover,
  &.active {
    color: ${props => props.theme.buttonHoverColor};
    background-color: rgba(255, 255, 255, 0.1);
  }
  &:focus,
  &.active {
    border-left: 3px solid ${props => props.theme.accentColor} !important;
  }
`;

const LeftMenuBarButton = ({ active, onClick, children }) => (
  <StyledButton className={classnames({ active })} onClick={onClick}>
    <Button
      style={{
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        background: "inherit",
        color: "inherit"
      }}
    >
      {children}
    </Button>
  </StyledButton>
);
LeftMenuBarButton.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.any,
  onClick: PropTypes.any
};

const LeftMenu = ({
  leftPane,
  rightPane,
  bottomPane,
  toggleQueryPane,
  toggleEntityPane,
  toggleFilterPane,
  toggleLayerPane,
  toggleGridPane
}) => (
  <Wrapper>
    <Nav tabs style={{ position: "absolute", top: 0 }}>
      <NavItem>
        <LeftMenuBarButton
          active={leftPane === "QUERY"}
          onClick={() => toggleQueryPane()}
        >
          <FaSearch />
        </LeftMenuBarButton>
      </NavItem>
      <NavItem>
        <LeftMenuBarButton
          active={leftPane === "ENTITY"}
          onClick={() => toggleEntityPane()}
          icon="user"
        >
          <MdList size="1.5em" />
        </LeftMenuBarButton>
      </NavItem>
      <NavItem>
        <LeftMenuBarButton
          active={leftPane === "FILTER"}
          onClick={() => toggleFilterPane()}
        >
          <FaFilter />
        </LeftMenuBarButton>
      </NavItem>
    </Nav>
    <Nav tabs style={{ position: "absolute", bottom: 0 }}>
      <NavItem>
        <LeftMenuBarButton
          active={bottomPane === "GRID"}
          onClick={() => toggleGridPane()}
        >
          <MdHourglassEmpty size="1.5em" />
        </LeftMenuBarButton>
      </NavItem>
      <NavItem>
        <LeftMenuBarButton
          active={bottomPane === "GRID"}
          onClick={() => toggleGridPane()}
        >
          <FaTh />
        </LeftMenuBarButton>
      </NavItem>
    </Nav>
  </Wrapper>
);
LeftMenu.propTypes = {
  leftPane: PropTypes.string,
  rightPane: PropTypes.string,
  bottomPane: PropTypes.string,
  toggleQueryPane: PropTypes.func,
  toggleEntityPane: PropTypes.func,
  toggleFilterPane: PropTypes.func,
  toggleLayerPane: PropTypes.func,
  toggleGridPane: PropTypes.func
};

function mapStateToProps(state, props) {
  return {
    leftPane: state.panel.LEFT,
    bottomPane: state.panel.BOTTOM
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleQueryPane,
      toggleEntityPane,
      toggleFilterPane,
      toggleLayerPane,
      toggleGridPane
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
