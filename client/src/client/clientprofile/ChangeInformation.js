import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import Typography from "@mui/material/Typography";
import { Alert } from "@mui/material/";

import styles from "./changeinformation.module.css";
const axios = require("axios").default;

function ChangeInformation({
  credentials,
  setCredentials,
  setOpenSnackbar,
  handleCloseDialog,
}) {
  const navigate = useNavigate();
  // State that declares if the error errorAlert will be displayed or not
  const [error, setError] = useState(false);
  // State that contains the errorAlert message
  const [errorMessage, setErrorMessage] = useState("");
  // Sate that contains the username of the user
  const [username, setUsername] = useState(credentials.username);
  // State that declares if the rules are being displayed or not
  const [showRules, setShowRules] = useState(false);
  // State that declares the state of the first rule
  const [firstRule, setFirstRule] = useState(false);
  // State that declares the state of the second rule
  const [secondRule, setSecondRule] = useState(false);
  // State that declares the state of the third rule
  const [thirdRule, setThirdRule] = useState(false);
  // State that declares the state of the forth rule
  const [forthRule, setForthRule] = useState(false);

  // State that contains the password of the user and the display mode of the password
  const [values, setValues] = useState({
    password: "",
    showPassword: false,
  });

  // Function that changes the password of the user
  const handleChangeUsernamePassword = async () => {
    if (
      username !== "" &&
      values.password !== "" &&
      username.length <= 20 &&
      values.password.length >= 8 &&
      values.password.length <= 20 &&
      values.password.match(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}/
      )
    ) {
      const result = await axios
        .post("/login-register/change", {
          newUsername: username,
          newPassword: values.password,
        })
        .then((response) => response.data)
        .catch((error) => console.log(error));

      if (!result.hasAccessPermission) {
        navigate("/");
      }

      if (result.errorMessage === "") {
        setCredentials({
          username: username,
        });

        setOpenSnackbar(true);
        handleCloseDialog();
      } else {
        setErrorMessage(result.errorMessage);
        setError(true);
      }
    } else {
      setErrorMessage("Username or password are invalid.");
      setError(true);
    }
  };

  // Handles the change of the password
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });

    setShowRules(true);
    checkPasswordRules({ ...values, [prop]: event.target.value }.password);
  };

  // Changes the visibility mode of the password
  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // errorAlert component
  const errorAlert = () => {
    return (
      <Stack sx={{ margin: "0px 0px 15px 0px" }} spacing={2}>
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

  const checkPasswordRules = (password) => {
    if (password.length >= 8 && password.length <= 20) {
      setFirstRule(true);
    } else {
      setFirstRule(false);
    }

    if (password.match(/(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{1,20}/)) {
      setSecondRule(true);
    } else {
      setSecondRule(false);
    }

    if (password.match(/(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{1,20}/)) {
      setThirdRule(true);
    } else {
      setThirdRule(false);
    }

    if (password.match(/(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{1,20}/)) {
      setForthRule(true);
    } else {
      setForthRule(false);
    }
  };

  // passwordRules component
  const passwordRulesComponent = () => {
    return (
      <Stack sx={{ margin: "0px 0px 15px 0px" }}>
        <div
          style={{
            color: firstRule ? "green" : "red",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {firstRule ? (
            <CheckIcon sx={{ fontSize: 20 }} />
          ) : (
            <ClearIcon sx={{ fontSize: 20 }} />
          )}
          <Typography
            variant="subtitle1"
            gutterBottom
            component="div"
            sx={{ margin: 0, fontSize: 14 }}
          >
            {"At least 8 and max 20 chars"}
          </Typography>
        </div>
        <div
          style={{
            color: secondRule ? "green" : "red",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {secondRule ? (
            <CheckIcon sx={{ fontSize: 20 }} />
          ) : (
            <ClearIcon sx={{ fontSize: 20 }} />
          )}
          <Typography
            variant="subtitle1"
            gutterBottom
            component="div"
            sx={{ margin: 0, fontSize: 14 }}
          >
            {"At least one capital letter"}
          </Typography>
        </div>
        <div
          style={{
            color: thirdRule ? "green" : "red",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {thirdRule ? (
            <CheckIcon sx={{ fontSize: 20 }} />
          ) : (
            <ClearIcon sx={{ fontSize: 20 }} />
          )}
          <Typography
            variant="subtitle1"
            gutterBottom
            component="div"
            sx={{ margin: 0, fontSize: 14 }}
          >
            {"At least one digit"}
          </Typography>
        </div>
        <div
          style={{
            color: forthRule ? "green" : "red",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {forthRule ? (
            <CheckIcon sx={{ fontSize: 20 }} />
          ) : (
            <ClearIcon sx={{ fontSize: 20 }} />
          )}
          <Typography
            variant="subtitle1"
            gutterBottom
            component="div"
            sx={{ margin: 0, fontSize: 14 }}
          >
            {"At least one special char (!@#$%^&*)"}
          </Typography>
        </div>
      </Stack>
    );
  };

  return (
    <div className={styles.change_settings_wrapper}>
      {error && errorAlert()}

      <TextField
        fullWidth
        label="Username"
        id="outlined-required"
        defaultValue={username}
        onChange={(input) => setUsername(input.target.value)}
      ></TextField>

      <FormControl fullWidth sx={{ margin: "15px 0px" }} variant="standard">
        <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
        <Input
          id="standard-adornment-password"
          type={values.showPassword ? "text" : "password"}
          value={values.password}
          onChange={handleChange("password")}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {values.showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      {showRules && passwordRulesComponent()}

      <Button
        variant="contained"
        color="custom"
        fullWidth
        onClick={() => handleChangeUsernamePassword()}
      >
        Change
      </Button>
    </div>
  );
}

export default ChangeInformation;
