import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./Components/App";

ReactDOM.render(<App />, document.getElementById("root"));

// Activate the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    let swPath = `service-worker.js`;
    navigator.serviceWorker.register(swPath).then(
      function(registration) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function(err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
