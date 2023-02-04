import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Login from "./login-register/Login";
import Register from "./login-register/Register";
import Error from "./error/Error";
import ClientMain from "./client/ClientMain";
import AdminMain from "./admin/AdminMain";
import AuthenticationContext from "./Authentication/AuthenticationContext";
import ClientPrivateRouter from "./PrivateRouter/ClientPrivateRouter";
import AdminPrivateRouter from "./PrivateRouter/AdminPrivateRouter";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const axios = require("axios").default;

const theme = createTheme({
  palette: {
    custom: {
      light: "#3949ad",
      main: "#5263c6",
      dark: "#3949ad",
      contrastText: "white",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

const verifyCookie = async () => {
  const result = await axios
    .post("/login-register/verify-cookie", {})
    .then((response) => response.data)
    .catch((error) => console.log(error));

  return result.hasAccessPermission;
};

function App() {
  const [authorizedUser, setAuthorizedUser] = useState(async () => {
    let existsInLocalStorage = localStorage.getItem("authorized-user");

    if (!existsInLocalStorage) {
      return false;
    } else if (
      JSON.parse(existsInLocalStorage).authorized &&
      (await verifyCookie())
    ) {
      return true;
    } else {
      localStorage.removeItem("authorized-user");
      return false;
    }
  });

  const [authorizedAdmin, setAuthorizedAdmin] = useState(async () => {
    let existsInLocalStorage = localStorage.getItem("authorized-admin");

    if (!existsInLocalStorage) {
      return false;
    } else if (
      JSON.parse(existsInLocalStorage).authorized &&
      (await verifyCookie())
    ) {
      return true;
    } else {
      localStorage.removeItem("authorized-admin");
      return false;
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <AuthenticationContext.Provider
        value={{
          authorizedUser,
          setAuthorizedUser,
          authorizedAdmin,
          setAuthorizedAdmin,
        }}
      >
        <Router>
          <Routes>
            <Route exact path="/" element={<Login />}></Route>
            <Route path="register" element={<Register />}></Route>
            <Route element={<ClientPrivateRouter />}>
              <Route path="client" element={<ClientMain />}></Route>
            </Route>
            <Route element={<AdminPrivateRouter />}>
              <Route path="admin" element={<AdminMain />}></Route>
            </Route>
            <Route path="*" element={<Error />}></Route>
          </Routes>
        </Router>
      </AuthenticationContext.Provider>
    </ThemeProvider>
  );
}

export default App;
