import React from "react";
import Typography from "@mui/material/Typography";
import styles from "./error.module.css";

function Error() {
  return (
    <React.Fragment>
      <div className={styles.screen}>
        <div className={styles.wrapper}>
          <div className={styles.center}>
            <div className={styles.text}>
              <Typography
                sx={{ fontSize: [19, "!important"] }}
                variant="subtitle1"
                gutterBottom
                component="div"
              >
                {"whoops... we could not find what you are looking for..."}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Error;
