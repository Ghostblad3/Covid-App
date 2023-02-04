import React from "react";
import HistoryWithCasesDataGrid from "./datagrids/HistoryWithCasesDataGrid";
import styles from "./contactwithcase.module.css";

function ContactWithCase({ userId }) {
  return (
    <React.Fragment>
      <div className={styles.contact_with_case_container}>
        <HistoryWithCasesDataGrid userId={userId} />
      </div>
    </React.Fragment>
  );
}

export default ContactWithCase;
