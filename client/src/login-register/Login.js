import React, { useState, useContext } from "react";
import { Alert } from "@mui/material/";
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
import Link from "@mui/material/Link";
import AuthenticationContext from "../Authentication/AuthenticationContext";
import styles from "./login.module.css";
const axios = require("axios").default;

const Login = () => {
  const navigate = useNavigate();
  // Value that states if the user is authorized to navigate to a protected route
  const { setAuthorizedUser, setAuthorizedAdmin } = useContext(
    AuthenticationContext
  );
  // State that saves the username
  const [username, setUsername] = useState("");
  // State that handles the open/close of the error
  const [error, setError] = useState(false);
  // State that saves the password and the password input mode
  const [values, setValues] = useState({
    password: "",
    showPassword: false,
  });

  // Handles the login
  const handleLoginAsync = async () => {
    if (
      username !== "" &&
      values.password !== "" &&
      username.length <= 20 &&
      values.password.length >= 8 &&
      values.password.length <= 20
    ) {
      const result = await axios
        .post("/login-register/login", {
          username: username,
          password: values.password,
        })
        .then((response) => response.data)
        .catch((error) => console.log(error));

      if (result.errorMessage !== "") {
        setError(true);
      } else if (result.data.isAdmin === 0) {
        localStorage.setItem(
          "authorized-user",
          JSON.stringify({
            authorized: true,
          })
        );

        setAuthorizedUser(true);
        navigate("/client");
      } else {
        localStorage.setItem(
          "authorized-admin",
          JSON.stringify({
            authorized: true,
          })
        );

        setAuthorizedAdmin(true);
        navigate("/admin");
      }
    } else {
      setError(true);
    }
  };

  // Handles the password input change event
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  // Handles the show password click event
  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const errorAlert = () => {
    return (
      <Alert
        sx={{ width: "80%", m: "20px 0px 20px 0px" }}
        onClose={() => {
          setError(false);
        }}
        severity="error"
      >
        Incorrect username or password.
      </Alert>
    );
  };

  return (
    <React.Fragment>
      <div className={styles.screen}>
        <div className={styles.center}>
          {error && errorAlert()}

          <Typography
            sx={{ fontSize: [35, "!important"] }}
            variant="subtitle1"
            gutterBottom
            component="div"
          >
            Login
          </Typography>

          <FormControl
            sx={{ width: "80%", m: "0px 0px 20px 0px" }}
            variant="standard"
          >
            <TextField
              label="Username"
              variant="standard"
              onChange={(input) => setUsername(input.target.value)}
            />
          </FormControl>

          <FormControl
            sx={{ width: "80%", m: "0px 0px 20px 0px" }}
            variant="standard"
          >
            <InputLabel htmlFor="standard-adornment-password">
              Password
            </InputLabel>
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

          <FormControl
            sx={{ width: "80%", m: "0px 0px 10px 0px" }}
            variant="standard"
          >
            <Button
              fullWidth
              variant="contained"
              color="custom"
              onClick={async () => {
                handleLoginAsync();
              }}
            >
              Login
            </Button>
          </FormControl>

          <div className={styles.signup}>
            <Typography sx={{ m: "0px" }} variant="body2" gutterBottom>
              Not a member?&nbsp;
            </Typography>

            <Link
              component="button"
              variant="body2"
              onClick={() => {
                navigate("/register");
              }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Login;
