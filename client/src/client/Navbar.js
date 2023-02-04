import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import MapIcon from "@mui/icons-material/Map";
import IconButton from "@mui/material/IconButton";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "./navbar.module.css";
const axios = require("axios").default;

function Navbar({ setDisplayed }) {
  const navigate = useNavigate();
  // State that handles if the navbar should collapse on website render
  const [collapse, setCollapse] = useState(window.innerWidth <= 650);
  // State that saves which navbar item was clicked last time
  const [item, setItem] = useState("map");

  const requestLogout = async () => {
    await axios
      .post("/login-register/logout", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));
  };

  return (
    <div
      className={
        collapse
          ? styles.navbar_container_collapse
          : styles.navbar_container_nocollapse
      }
    >
      <div
        className={
          collapse
            ? styles.navbar_top_space_collapse
            : styles.navbar_top_space_nocollapse
        }
      >
        <IconButton
          className={styles.collapse_button}
          style={{ borderRadius: 0, width: "50px", height: "50px" }}
          onClick={() => setCollapse(!collapse)}
          disableRipple
        >
          <MenuIcon />
        </IconButton>
      </div>

      <div>
        <div
          className={
            item === "map" ? styles.navbar_item_focused : styles.navbar_item
          }
          onClick={() => {
            setItem("map");
            setDisplayed("map");
          }}
        >
          <MapIcon className={styles.navbar_item_icon}></MapIcon>
          {!collapse && (
            <div className={styles.navbar_item_text}>
              <Typography
                sx={{
                  padding: 0,
                  margin: 0,
                }}
                variant="body2"
                gutterBottom
              >
                {"Map"}
              </Typography>
            </div>
          )}
        </div>
        <div
          className={
            item === "contactedcases"
              ? styles.navbar_item_focused
              : styles.navbar_item
          }
          onClick={() => {
            setItem("contactedcases");
            setDisplayed("contactedcases");
          }}
        >
          <PriorityHighIcon
            className={styles.navbar_item_icon}
          ></PriorityHighIcon>
          {!collapse && (
            <div className={styles.navbar_item_text}>
              <Typography
                sx={{
                  padding: 0,
                  margin: 0,
                }}
                variant="body2"
                gutterBottom
              >
                {"Contact with case"}
              </Typography>
            </div>
          )}
        </div>
        <div
          className={
            item === "addcase" ? styles.navbar_item_focused : styles.navbar_item
          }
          onClick={() => {
            setItem("addcase");
            setDisplayed("addcase");
          }}
        >
          <AddIcon className={styles.navbar_item_icon}></AddIcon>
          {!collapse && (
            <div className={styles.navbar_item_text}>
              <Typography
                sx={{
                  padding: 0,
                  margin: 0,
                }}
                variant="body2"
                gutterBottom
              >
                {"Declare case"}
              </Typography>
            </div>
          )}
        </div>
        <div
          className={
            item === "profile" ? styles.navbar_item_focused : styles.navbar_item
          }
          onClick={() => {
            setItem("profile");
            setDisplayed("profile");
          }}
        >
          <ManageAccountsIcon
            className={styles.navbar_item_icon}
          ></ManageAccountsIcon>
          {!collapse && (
            <div className={styles.navbar_item_text}>
              <Typography
                sx={{
                  padding: 0,
                  margin: 0,
                }}
                variant="body2"
                gutterBottom
              >
                {"Profile"}
              </Typography>
            </div>
          )}
        </div>
        <div
          className={styles.navbar_item}
          onClick={async () => {
            await requestLogout();
            localStorage.clear();
            navigate("/");
          }}
        >
          <ExitToAppIcon className={styles.navbar_item_icon}></ExitToAppIcon>
          {!collapse && (
            <div className={styles.navbar_item_text}>
              <Typography
                sx={{
                  padding: 0,
                  margin: 0,
                }}
                variant="body2"
                gutterBottom
              >
                {"Log out"}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
