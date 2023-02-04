import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Button } from "@mui/material";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { format } from "date-fns";
import { sub } from "date-fns";
import styles from "./addcase.module.css";
const axios = require("axios").default;

// Formats a date
function formatDate(input) {
  return format(input, "yyyy-MM-dd");
}

// Subtracks days from a date
function subDays(input, day) {
  return new Date(
    sub(input, {
      days: day,
    })
  );
}

function AddCase({ userId }) {
  const navigate = useNavigate();
  // State that handles the show/hide of the alert
  const [alertDisplay, setAlertDisplay] = useState(false);
  // State that sets the alert display message
  const [alertMessage, setAlertMessage] = useState("");
  // State that saves the type of alert (true -> error, false -> success)
  const [alertType, setAlertType] = useState(true);
  // State that saves the value of the case date
  const [value, setValue] = useState(formatDate(new Date()));

  // Handles the change of the calendar value
  const handleChange = (newValue) => {
    setValue(formatDate(new Date(newValue)));
  };

  // Declares a case
  const declareCaseAsync = async () => {
    const now = formatDate(new Date());
    const fourteenDaysBefore = formatDate(subDays(new Date(now), 14));

    if (value > now) {
      setAlertMessage("Cannot declare a case for a future date.");
      setAlertDisplay(true);
      setAlertType(true);
    } else if (value < fourteenDaysBefore) {
      setAlertMessage(
        "Cannot declare a case after 14 days have passed since the confirmation."
      );
      setAlertDisplay(true);
      setAlertType(true);
    } else {
      const result = await axios
        .post("/cases/add-case", {
          userId: userId,
          date: value,
        })
        .then((response) => response.data)
        .catch((error) => console.log(error));

      if (!result.hasAccessPermission) {
        navigate("/");
      }

      if (result.errorMessage === "") {
        setAlertMessage("Success.");
        setAlertDisplay(true);
        setAlertType(false);
      } else {
        setAlertMessage(result.errorMessage);
        setAlertDisplay(true);
        setAlertType(true);
      }
    }
  };

  const customAlert = () => {
    return (
      <Stack className={styles.dec_case_error_stack} spacing={2}>
        <Alert
          className={styles.error_alert}
          onClose={() => {
            setAlertDisplay(false);
          }}
          severity={alertType ? "error" : "success"}
        >
          {alertMessage}
        </Alert>
      </Stack>
    );
  };

  return (
    <React.Fragment>
      <div className={styles.dec_case_top}>
        <div className={styles.dec_case_top_center}>
          {alertDisplay && (
            <div className={styles.dec_case_error}>{customAlert()}</div>
          )}
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
              label="Diagnosed date"
              inputFormat="YYYY/MM/DD"
              value={value}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
          <div className={styles.dec_case_button}>
            <Button
              variant="contained"
              color="custom"
              onClick={async () => declareCaseAsync()}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default AddCase;
