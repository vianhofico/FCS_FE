import React from "react";
import ReactDOM from "react-dom/client";

import "antd/dist/reset.css";
import "@fontsource/be-vietnam-pro";
import "@fontsource/playfair-display";
import "@fontsource/great-vibes";
import "./style.css";

import { App } from "@/app/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
