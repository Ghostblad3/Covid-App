import React, { useState } from "react";
import Navbar from "./Navbar";
import ClientMainSearch from "./ClientMainSearch";
import Profile from "./Profile";
import AddCase from "./AddCase";
import ContactWithCase from "./ContactWithCase";
import styles from "./clientmain.module.css";
import TopBarInfo from "./TopBarInfo";

function Main() {
  // State that saves the name of which component should be shown
  const [displayed, setDisplayed] = useState("map");

  const display = () => {
    if (displayed === "map") {
      return <ClientMainSearch />;
    } else if (displayed === "profile") {
      return <Profile />;
    } else if (displayed === "addcase") {
      return <AddCase />;
    } else if (displayed === "contactedcases") {
      return <ContactWithCase />;
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.screen_top}>
        <TopBarInfo />
      </div>
      <div className={styles.screen_bottom}>
        <Navbar setDisplayed={setDisplayed} />
        <div className={styles.main_container}>
          <div className={styles.main_container_internal}>{display()}</div>
        </div>
      </div>
    </div>
  );
}

export default Main;
