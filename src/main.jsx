import React from "react";
import ReactDOM from "react-dom/client";
import { Index } from "./index.jsx";
import "./index.css";
import 'react-loading-skeleton/dist/skeleton.css'
import 'sweetalert2/src/sweetalert2.scss'


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);
