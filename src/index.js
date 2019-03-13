import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "react-reflex/styles.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import registerServiceWorker from "./registerServiceWorker";
import { Provider } from "react-redux";
import store from "./js/store";
import "babel-polyfill";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
