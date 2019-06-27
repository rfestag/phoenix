import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import SettingsModal from "./modules/settings/SettingsModal";
import UserLayerModal from "./modules/map/UserLayerModal";
import Banner from "./components/Banner";
import TopMenu from "./components/TopMenu";
import LeftMenu from "./components/LeftMenu";
import MainPanels from "./components/MainPanels";
import { ThemeProvider } from "styled-components";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import { light, dark } from "./themes";

const themeProps = {
  light,
  dark
};

const getTheme = (state, props) => state.settings.general.theme;
const getThemeProps = createSelector([getTheme], theme => {
  return themeProps[theme];
});

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
  overflow: hidden;
`;

const App = ({ themeName, themeProps }) => (
  <div>
    <link
      rel={themeName === "light" ? "stylesheet" : "stylesheet alternate"}
      type="text/css"
      href={process.env.PUBLIC_URL + "/light.css"}
    />
    <link
      rel={themeName === "dark" ? "stylesheet" : "stylesheet alternate"}
      type="text/css"
      href={process.env.PUBLIC_URL + "/dark.css"}
    />
    <ThemeProvider theme={themeProps}>
      <Outer>
        <SettingsModal />
        <UserLayerModal />
        <Banner>Phoenix GIS</Banner>
        <TopMenu />
        <Main>
          <LeftMenu />
          <MainPanels />
        </Main>
        <Banner>
          Copyright &copy; 2019 Phoenix Project Team. All rights reserved
        </Banner>
      </Outer>
    </ThemeProvider>
  </div>
);

App.propTypes = {
  themeName: PropTypes.string.isRequired,
  themeProps: PropTypes.object.isRequired
};

function mapStateToProps(state, props) {
  return {
    themeName: getTheme(state, props),
    themeProps: getThemeProps(state, props)
  };
}
export default connect(mapStateToProps, null)(App);
