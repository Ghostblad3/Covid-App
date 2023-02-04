import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from "react-router-dom";
import StorageIcon from "@mui/icons-material/Storage";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DateRangeIcon from "@mui/icons-material/DateRange";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import { Typography } from "@mui/material";
import styles from "./navbar.module.css";
const axios = require("axios").default;

function Navbar({ setDisplayed }) {
  const navigate = useNavigate();
  // State that saves the name of last clicked navbar item
  const [item, setItem] = useState("manipulate_data");
  // State that saves if the navbar should collapse or not
  const [collapse, setCollapse] = useState(window.innerWidth <= 550);

  const requestLogout = async () => {
    await axios
      .post("/login-register/logout", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));
  };

  return (
    <div
      className={
        collapse ? styles.container_collapse : styles.container_nocollapse
      }
    >
      <div
        className={
          collapse ? styles.top_space_collapse : styles.top_space_nocollapse
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
            item === "manipulate_data"
              ? styles.narvbar_item_focused
              : styles.navbar_item
          }
          onClick={() => {
            setItem("manipulate_data");
            setDisplayed("manipulate_data");
          }}
        >
          <StorageIcon className={styles.narvbar_item_icon}></StorageIcon>
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
                {"Manipulate data"}
              </Typography>
            </div>
          )}
        </div>
        <div
          className={
            item === "general_stats"
              ? styles.narvbar_item_focused
              : styles.navbar_item
          }
          onClick={() => {
            setItem("general_stats");
            setDisplayed("general_stats");
          }}
        >
          <AnalyticsIcon className={styles.narvbar_item_icon}></AnalyticsIcon>
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
                {"General stats"}
              </Typography>
            </div>
          )}
        </div>
        <div
          className={
            item === "day_stats"
              ? styles.narvbar_item_focused
              : styles.navbar_item
          }
          onClick={() => {
            setItem("day_stats");
            setDisplayed("day_stats");
          }}
        >
          <DateRangeIcon className={styles.narvbar_item_icon}></DateRangeIcon>
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
                {"Per day stats"}
              </Typography>
            </div>
          )}
        </div>
        <div
          className={
            item === "hour_stats"
              ? styles.narvbar_item_focused
              : styles.navbar_item
          }
          onClick={() => {
            setItem("hour_stats");
            setDisplayed("hour_stats");
          }}
        >
          <QueryBuilderIcon
            className={styles.narvbar_item_icon}
          ></QueryBuilderIcon>
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
                {"Per hour stats"}
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
          <ExitToAppIcon className={styles.narvbar_item_icon}></ExitToAppIcon>
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
