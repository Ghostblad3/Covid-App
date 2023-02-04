import React from "react";
import { Paper } from "@mui/material";
import AdminTabs from "./AdminTabs";
import styles from "./manipulatedata.module.css";

function ManipulateData() {
  return (
    <div className={styles.wrapper}>
      <Paper sx={{ width: "100%" }} elevation={0}>
        <AdminTabs />
      </Paper>
    </div>
  );
}

export default ManipulateData;
