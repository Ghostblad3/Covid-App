import React, { useState } from "react";
import Navbar from "./Navbar";
import GeneralStats from "./GeneralStats";
import PerDayStats from "./PerDayStats";
import PerHourStats from "./PerHourStats";
import ManipulateData from "./ManipulateData";
import styles from "./adminmain.module.css";

function AdminMain() {
  // State that saves the name of the visible component
  const [displayed, setDisplayed] = useState("manipulate_data");

  const display = () => {
    if (displayed === "manipulate_data") {
      return <ManipulateData />;
    } else if (displayed === "general_stats") {
      return <GeneralStats />;
    } else if (displayed === "hour_stats") {
      return <PerHourStats />;
    } else if (displayed === "day_stats") {
      return <PerDayStats />;
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.screen_top}></div>
      <div className={styles.screen_bottom}>
        <Navbar setDisplayed={setDisplayed} />
        <div className={styles.main_container}>
          <div className={styles.main_container_internal}>{display()}</div>
        </div>
      </div>
    </div>
  );
}

export default AdminMain;
