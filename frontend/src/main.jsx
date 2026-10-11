import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import { SocketProvider } from "./contexts/socketContext.jsx";
import { PeerProvider } from "./contexts/peer.jsx";
import { CallProvider } from "./custom-hooks/useWebRTC.jsx";
const rawServerUrl =
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_API_PORT ||
  "http://localhost:8000";

export const Serverurl = (
  rawServerUrl.startsWith("http://") || rawServerUrl.startsWith("https://")
    ? rawServerUrl
    : `http://localhost:${rawServerUrl}`
).replace(/\/+$/, "");

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <SocketProvider>
        <PeerProvider>
          <CallProvider>
            <App />
          </CallProvider>
        </PeerProvider>
      </SocketProvider>
    </Provider>
  </BrowserRouter>,
);
