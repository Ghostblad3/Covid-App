import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import LoadingButton from "@mui/lab/LoadingButton";
import FilesDataGrid from "./FilesDataGrid";
import UploadIcon from "@mui/icons-material/Upload";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import styles from "./uploadcomponent.module.css";
const Ajv = require("ajv");
const axios = require("axios").default;

const schema = {
  type: "array",
  minItems: 1,
  items: [
    {
      type: "object",
      properties: {
        id: { type: "string", maxLength: 27, minLength: 1 },
        name: { type: "string", maxLength: 90, minLength: 1 },
        address: { type: "string", maxLength: 65, minLength: 1 },
        coordinates: {
          type: "object",
          required: ["lat", "lng"],
          properties: {
            lat: { type: "number" },
            lng: { type: "number" },
          },
        },
        types: {
          type: "array",
          items: { type: "string", minLength: 1 },
          minItems: 1,
          uniqueItems: true,
        },
        populartimes: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: {
            type: "object",
            required: ["name", "data"],
            properties: {
              name: { type: "string" },
              data: {
                type: "array",
                items: { type: "integer", minimum: 0, maximum: 100 },
                maxItems: 24,
                minItems: 24,
              },
            },
          },
        },
      },
      required: [
        "id",
        "name",
        "address",
        "coordinates",
        "types",
        "populartimes",
      ],
    },
  ],
  additionalProperties: true,
};

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function UploadComponent() {
  const navigate = useNavigate();
  // State that saves the data that will be uploaded
  const [data, setData] = useState([]);
  // State that saves the invalid file names
  const [invalid, setInvalid] = useState([]);
  // State that saves if select button is disable or not
  const [disabledLoadButton, setDisabledLoadButton] = useState(false);
  // State that saves if upload button is disable or not
  const [disabledUploadButton, setDisabledUploadButton] = useState(false);
  // State that saves uploading or not uploading state
  const [uploading, setUploading] = useState(false);
  // State that saves if files are loading or not loading state
  const [loadingFiles, setLoadingFiles] = useState(false);
  // State that saves if data are valid and can be uploaded
  const [haveData, setHaveData] = useState(false);
  // State that is responsible for clicking the input field
  const inputFile = useRef(null);
  // State that saves if snackbar should open or not
  const [open, setOpen] = useState(false);
  // State that saves the snackbar display text
  const [displayedText, setDisplayedText] = useState("");

  // Handler for closing the snackbar
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  // Handler for the select files button click
  const onClick = (e) => {
    inputFile.current.click();
  };

  // Validates a json file
  const callback = (result, name, date, poiData, badFiles) => {
    try {
      const obj = JSON.parse(result);
      const ajv = new Ajv();
      const validate = ajv.compile(schema);

      if (validate(obj)) {
        obj.forEach((item) => {
          item.date = date;
          poiData.push(item);
        });
      } else {
        //console.log("problem");
        badFiles.push(name);
        setInvalid((old) => [...old, name]);
      }
    } catch (e) {
      //console.log("problem");
      badFiles.push(name);
      setInvalid((old) => [...old, name]);
    }
  };

  // Handler for input files change
  const handleFileChange = async (event) => {
    setData([]);
    setInvalid([]);
    setDisabledLoadButton(true);
    setDisabledUploadButton(true);
    setLoadingFiles(true);
    setHaveData(false);

    const start = new Date();
    const files = Array.from(event.target.files || []);
    var promises = [];

    var poiData = [];
    var badFiles = [];

    files.forEach(
      (file) => {
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");

        promises.push(
          new Promise((resolve, reject) => {
            fileReader.onload = (e) => {
              callback(
                e.target.result,
                file.name,
                new Date(file.lastModified),
                poiData,
                badFiles
              );

              resolve();
            };
          })
        );
      },
      poiData,
      badFiles
    );

    await Promise.all(promises);

    if (badFiles.length === 0) {
      removeDuplicates(poiData);

      poiData.forEach((item) => {
        item.types = item.types.map((subItem) => subItem.replace("/_/g", " "));
      });

      setData(poiData);
    }

    setInvalid(badFiles);

    const end = new Date();
    const duration = end - start;

    if (duration < 1000) {
      const delay = 1000 - duration;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (badFiles.length === 0) {
      setHaveData(true);
    }

    setLoadingFiles(false);
    setDisabledLoadButton(false);
    setDisabledUploadButton(false);
  };

  // Removes the duplicate files
  const removeDuplicates = (poiData) => {
    if (poiData.length > 0) {
      var final = [];

      poiData.forEach((item) => {
        const exists = final.find((x) => x.id === item.id);

        if (!exists) {
          final.push(item);
        } else if (exists.date < item.date) {
          final = final.filter((x) => x.id !== exists.id);
          final.push(item);
        }
      });

      poiData = final;
    }
  };

  // Handler for upload button click
  const onUploadClick = async () => {
    setDisabledLoadButton(true);
    setDisabledUploadButton(true);
    setUploading(true);
    setOpen(false);

    if (invalid.length === 0 && data.length > 0) {
      await insertNewPoisDataAsync(data);
      setDisplayedText("Successfully uploaded the files!");
      setOpen(true);
    }

    setHaveData(false);
    setUploading(false);
    setDisabledLoadButton(false);
    setDisabledUploadButton(false);
    setData([]);
    setInvalid([]);
  };

  // Uploads new POI data
  const insertNewPoisDataAsync = async (input) => {
    const start = new Date();

    const fetchResult = await axios
      .post(`/add-update-poi/add-poi`, {
        poi: input,
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    var end = new Date();

    const duration = end - start;

    if (duration < 1000) {
      const delay = 1000 - duration;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  return (
    <Paper sx={{ width: "100%" }} elevation={0}>
      <div className={styles.wrapper}>
        <Typography
          sx={{ margin: "20px 0px 10px 0px", fontSize: "20px" }}
          variant="body1"
          gutterBottom
        >
          {"Upload new POI"}
        </Typography>

        {invalid.length > 0 && !loadingFiles && (
          <Typography
            sx={{
              margin: "0px 20px 20px 20px",
              fontSize: "15px",
            }}
            variant="body1"
            gutterBottom
          >
            {invalid.length === 1
              ? "The following file contains invalid or unparsable data and will not be uploaded to the server. Please select only valid files otherwise none of the files will be uploaded."
              : "The following files contain invalid or unparsable data and will not be uploaded to the server. Please select only valid files otherwise none of the files will be uploaded."}
          </Typography>
        )}

        {invalid.length > 0 && !loadingFiles && (
          <FilesDataGrid files={invalid} />
        )}

        <input
          type="file"
          id="file"
          ref={inputFile}
          accept=".json"
          multiple="multiple"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e)}
        />

        {(uploading || loadingFiles) && <CircularProgress />}

        <div className={styles.buttons}>
          <Button
            sx={{ width: "100%", margin: "0px 0px 0px 0px" }}
            variant="contained"
            onClick={() => onClick()}
            color="custom"
            disabled={disabledLoadButton}
          >
            Select files
          </Button>

          <LoadingButton
            onClick={() => onUploadClick()}
            disabled={disabledUploadButton || !haveData}
            endIcon={<UploadIcon />}
            loadingPosition="end"
            variant="contained"
            sx={{ width: "100%", margin: "20px 0px 0px 0px" }}
            color="custom"
          >
            Upload
          </LoadingButton>
        </div>
      </div>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {displayedText}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default UploadComponent;
