import React, { useState } from "react";
import { Alert } from "@mui/material/";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import styles from "./register.module.css";

const axios = require("axios").default;

const Register = () => {
  const navigate = useNavigate();

  // State that saves the username
  const [username, setUsername] = useState("");
  // State that saves the email
  const [email, setEmail] = useState("");
  // State that handles the show/hide of the error
  const [error, setError] = useState(false);
  // State that saves the error message
  const [errorMessage, setErrorMessage] = useState("");
  // State that handles the show/hide of the rules
  const [showRules, setShowRules] = useState(false);
  // State that handles the change of the first rule
  const [firstRule, setFirstRule] = useState(false);
  // State that handles the change of the second rule
  const [secondRule, setSecondRule] = useState(false);
  // State that handles the change of the third rule
  const [thirdRule, setThirdRule] = useState(false);
  // State that handles the change of the forth rule
  const [forthRule, setForthRule] = useState(false);
  // State that saves the password and the password input visibility mode
  const [values, setValues] = useState({
    password: "",
    showPassword: false,
  });

  // Handles the register
  const handleRegister = async () => {
    if (
      username !== "" &&
      values.password !== "" &&
      email !== "" &&
      username.length <= 20 &&
      values.password.length <= 20 &&
      email.length <= 20 &&
      values.password.length >= 8
    ) {
      var passwordFormat =
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}/; // eslint-disable-line
      var mailformat =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line

      if (email.match(mailformat) && values.password.match(passwordFormat)) {
        const result = await axios
          .post("/login-register/register", {
            username: username,
            password: values.password,
            email: email,
          })
          .then((response) => response.data)
          .catch((error) => console.log(error));

        if (result.errorMessage === "") {
          setError(false);
          navigate("/");
        } else {
          setErrorMessage(result.errorMessage);
          setError(true);
        }
      } else {
        setErrorMessage("Email or password are not in correct format.");
        setError(true);
      }
    } else {
      setErrorMessage("Fields are not in correct format.");
      setError(true);
    }
  };

  // Handles the change of the password
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    if (event.target.value !== values.password) {
      setShowRules(true);
      checkPasswordRules({ ...values, [prop]: event.target.value }.password);
    }
  };

  // Handles the show password button click event
  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Checks for the password rules
  const checkPasswordRules = (password) => {
    if (password.length >= 8 && password.length <= 20) {
      setFirstRule(true);
    } else {
      setFirstRule(false);
    }

    if (password.match(/(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{1,20}/)) {
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

  const passwordRulesComponent = () => {
    return (
      <Stack sx={{ margin: "0px 0px 0px 0px", width: "80%" }}>
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
            At least 8 chars and max 20 chars
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
            className={styles.rules_typography}
            variant="subtitle1"
            gutterBottom
            component="div"
            sx={{ margin: 0, fontSize: 14 }}
          >
            At least one lowercase and capital letter
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
            className={styles.rules_typography}
            variant="subtitle1"
            gutterBottom
            component="div"
            sx={{ margin: 0, fontSize: 14 }}
          >
            At least one digit
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
            className={styles.rules_typography}
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

  const errorAlert = () => {
    return (
      <Stack sx={{ width: "80%", margin: "20px 0px 0px 0px" }} spacing={2}>
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
    <React.Fragment>
      <div className={styles.screen}>
        <div className={styles.center}>
          {error && errorAlert()}

          <Typography
            sx={{ margin: "20px 0px 0px 0px" }}
            variant="h4"
            component="h1"
          >
            Register
          </Typography>

          <TextField
            sx={{ width: "80%", margin: "20px 0px" }}
            label="Username"
            variant="standard"
            onChange={(input) => setUsername(input.target.value)}
          />

          <TextField
            sx={{ width: "80%", margin: "0px 0px 20px 0px" }}
            label="Email"
            variant="standard"
            onChange={(input) => setEmail(input.target.value)}
          />

          <FormControl
            sx={{ width: "80%", margin: "0px 0px 20px 0px" }}
            variant="standard"
          >
            <InputLabel htmlFor="standard-adornment-password">
              Password
            </InputLabel>

            <Input
              id="standard-adornment-password"
              type={values.showPassword ? "text" : "password"}
              value={values.password}
              autoComplete="new-password"
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
            sx={{ width: "80%", margin: "20px 0px 10px 0px" }}
            variant="contained"
            color="custom"
            onClick={() => handleRegister()}
          >
            Register
          </Button>

          <Button
            sx={{ width: "80%", margin: "0px 0px 20px 0px" }}
            variant="contained"
            color="custom"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Register;
