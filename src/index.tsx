import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import "typeface-roboto";
// import "chartjs-adapter-luxon";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { JeepSqlite } from "jeep-sqlite/dist/components/jeep-sqlite";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import "./index.css";
import "./plugins";
import { lightTheme, darkTheme } from "./theme/theme";
import { useMediaQuery } from "@mui/material";
import { observer } from "mobx-react";
import { useStore } from "./models/store";
import { ThemeModeType } from "./models/settings";

// For web, add sqlite wasm
customElements.define("jeep-sqlite", JeepSqlite);
window.addEventListener("DOMContentLoaded", async () => {
  const platform = Capacitor.getPlatform();
  if (platform === "web") {
    const jeepSqlite = document.createElement("jeep-sqlite");
    document.body.appendChild(jeepSqlite);
  }
});

const AppContainer = observer(() => {
  const { root: { settings: { isDarkMode, themeMode, setTheme } } } = useStore();
  const systemDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const useDarkMode =
    isDarkMode ||
    (themeMode === ThemeModeType.system && systemDarkMode);
  const theme = React.useMemo(
    () => (useDarkMode ? darkTheme : lightTheme),
    [useDarkMode]
  );
  setTheme(theme);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
