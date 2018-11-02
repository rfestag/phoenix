import React from "react";
import styled from "styled-components";
import EnrichMenu from "./EnrichMenu";
import FilterMenu from "./FilterMenu";
import LayoutMenu from "./LayoutMenu";
import ViewMenu from "./ViewMenu";
import SettingsMenu from "./SettingsMenu";
import AdminMenu from "./AdminMenu";
import HelpMenu from "./HelpMenu";
import { ButtonGroup } from "reactstrap";
import { FaPhoenixSquadron } from "react-icons/fa";

const Wrapper = styled.div`
  background-color: ${props => props.theme.menuBarBg};
  display: flex;
  flex: none;
  height: 36px;
`;
const Spacer = styled.div`
  flex: 1;
`;
const Brand = styled(FaPhoenixSquadron)`
  color: ${props => props.theme.accentColor};
`;

const TopMenu = () => (
  <Wrapper>
    <Brand size={28} className="icon-brand" />
    <ButtonGroup>
      <EnrichMenu />
      <FilterMenu />
      <LayoutMenu />
      <ViewMenu />
    </ButtonGroup>
    <Spacer />
    <ButtonGroup>
      <AdminMenu />
      <HelpMenu />
      <SettingsMenu />
    </ButtonGroup>
  </Wrapper>
);
export default TopMenu;
