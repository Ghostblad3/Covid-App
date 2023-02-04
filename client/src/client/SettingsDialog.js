import React, { useState } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ChangeInformation from "./clientprofile/ChangeInformation";

function SettingsDialog({ onClose, open, credentials, setCredentials }) {
  // State that handles the open/close of the snackbar
  const [openSnackBar, setOpenSnackbar] = useState(false);

  // Handles the close of the SettingsDialog
  const handleCloseDialog = () => {
    onClose();
  };

  // Handles the close of the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false); // closes the snackbar
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <React.Fragment>
      <Dialog onClose={handleCloseDialog} open={open}>
        <DialogTitle sx={{ textAlign: "center" }}>
          Change profile information
        </DialogTitle>
        <Divider light />
        <ChangeInformation
          credentials={credentials}
          setCredentials={setCredentials}
          setOpenSnackbar={setOpenSnackbar}
          handleCloseDialog={handleCloseDialog}
        />
      </Dialog>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {"Successfully changed username and password!"}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export default SettingsDialog;
