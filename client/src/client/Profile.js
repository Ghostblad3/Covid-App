import React from "react";
import BasicTabs from "./BasicTabs";
import styles from "./profile.module.css";

function Profile() {
  return (
    <div className={styles.wrapper}>
      <BasicTabs></BasicTabs>
    </div>
  );
}

export default Profile;
