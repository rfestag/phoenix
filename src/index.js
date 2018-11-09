import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "react-reflex/styles.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import registerServiceWorker from "./registerServiceWorker";
import { Provider } from "react-redux";
import store from "./js/store";
import { ThemeProvider } from "styled-components";
import "babel-polyfill";

//TODO: Support dynamically importing theme?
import "./stylesheets/dark.css";

/*eslint-disable*/
const theme = require('sass-extract-loader?{"includePaths":["./node_modules"],"plugins": ["sass-extract-js"]}!./stylesheets/themes/dark/_variables.scss');
/*eslint-enable*/
console.log("THEME", theme);
ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
