import React from "react";
import styled from "styled-components";
import SettingsModal from "./modules/settings/SettingsModal";
import Banner from "./components/Banner";
import TopMenu from "./components/TopMenu";
import LeftMenu from "./components/LeftMenu";
import MainPanels from "./components/MainPanels";

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

/*
  componentDidMount() {
    if (window.WebSocket) {
      this.props.createQuery("ADSBApollo", {}, "ADSB Exchange");
    }
  }
  */

const App = () => (
  <Outer>
    <SettingsModal />
    <Banner>Phoenix GIS</Banner>
    <TopMenu />
    <Main>
      <LeftMenu />
      <MainPanels />
    </Main>
    <Banner>
      Copyright &copy; 2018 Phoenix Project Team. All rights reserved
    </Banner>
  </Outer>
);
export default App;
