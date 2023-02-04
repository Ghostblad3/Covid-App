import React, { useEffect, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import { Typography } from "@mui/material";
import styles from "./topbarinfo.module.css";
import SettingsDialog from "./SettingsDialog";
const axios = require("axios").default;

function TopBarInfo() {
  // State for handling SettingsDialog open/close
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
  });

  useEffect(() => {
    requestCredentials();
  }, []);

  const requestCredentials = async () => {
    const result = await axios
      .post("/login-register/request-credentials", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));

    setCredentials(result.data);
  };

  // Handles the SettingsDialog close
  const handleClose = (value) => {
    setOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.empty}></div>

      <Avatar
        sx={{ width: 28, height: 28, display: "flex" }}
        alt=""
        src={require("./icons/1.png").default}
      />
      <Typography
        sx={{
          color: "white",
          padding: 0,
          margin: "0px 10px",
        }}
        variant="body2"
        gutterBottom
      >
        {credentials.username}
      </Typography>

      <IconButton
        disableRipple
        sx={{ mr: "20px", padding: 0 }}
        onClick={() => setOpen(true)}
      >
        <SettingsIcon sx={{ color: "white" }} />
      </IconButton>

      <SettingsDialog
        open={open}
        onClose={handleClose}
        credentials={credentials}
        setCredentials={setCredentials}
      />
    </div>
  );
}

export default TopBarInfo;
