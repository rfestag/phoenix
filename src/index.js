import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import registerServiceWorker from "./registerServiceWorker";
import "leaflet/dist/leaflet.css";
import { Provider } from "react-redux";
import store from "./js/store";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
