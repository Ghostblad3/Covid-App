import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { Alert } from "@mui/material/";
import Stack from "@mui/material/Stack";
import styles from "./visitdialog.module.css";
const axios = require("axios").default;

function VisitDialog({ onClose, open, selectedPoiId, setOpenSnackbar }) {
  const navigate = useNavigate();
  // State that handles the show/hide of error
  const [error, setError] = useState(false);
  // State that saves the error message
  const [errorMessage, setErrorMessage] = useState("");

  // Handles the close of the VisitDialog component
  const handleClose = () => {
    setErrorMessage("");
    setError(false);
    onClose();
  };

  const handleSubmitAsync = async () => {
    const result = await axios
      .post("/visits/add-visit", {
        poiId: selectedPoiId,
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!result.hasAccessPermission) {
      navigate("/");
    }

    if (result.errorMessage !== "") {
      setErrorMessage(result.errorMessage);
      setError(true); // show error
    } else {
      setOpenSnackbar(true); // open snackbar
      handleClose(); // close the dialog
    }
  };

  const errorAlert = () => {
    return (
      <Stack sx={{ margin: "0px 0px 15px 0px", maxWidth: "300px" }}>
        <Alert
          onClose={() => {
            setError(false);
          }}
          severity="error"
        >
          {errorMessage}
        </Alert>
      </Stack>
    );
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle sx={{ textAlign: "center" }}>
        Add visit intention
      </DialogTitle>

      <Divider light />

      <div className={styles.wrapper}>
        {error && errorAlert()}

        <Button
          fullWidth
          variant="contained"
          onClick={async () => await handleSubmitAsync()}
          color="custom"
        >
          Submit
        </Button>
      </div>
    </Dialog>
  );
}

export default VisitDialog;
