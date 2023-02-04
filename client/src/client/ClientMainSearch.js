import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import Map from "./Map";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Grid from "@mui/material/Grid";
import MuiAccordion from "@mui/material/Accordion";
import { styled } from "@mui/material/styles";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getISODay } from "date-fns";
import styles from "./clientmainsearch.module.css";
const axios = require("axios").default;

const dayAsInt = () => {
  return getISODay(new Date());
};

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "0.2rem 0px",
  boxShadow: "0 3px 2px -2px gray",
  "&:not(:last-child)": {
    borderBottom: 20,
  },
  "&:before": {
    display: "none",
  },
}));

function ClientMainSearch() {
  const navigate = useNavigate();
  // State for storing the position
  const [position, setPosition] = useState(["", ""]);
  // State for storing all the POI
  const [allPois, setPois] = useState([]);
  // State for storing all the categories
  const [categories, setCategories] = useState([]);
  // State for storing all the searched POI
  const [searchedPois, setSearchedPois] = useState([]);
  // State for storing all the nearby POI
  const [nearbyPois, setNearbyPois] = useState([]);
  // State for storing the slider value
  const [value, setValue] = useState(1);
  // State for handling if changing the value of the slider will trigger the fetch of the nearby POI on the handleSliderChange event handler
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const coords = await getPosition();
    await asyncFetchPois(coords);
    await asyncFetchPoisCategories();
  };

  const getPosition = async () => {
    const coords = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (geolocation) => {
          setPosition([
            geolocation.coords.latitude,
            geolocation.coords.longitude,
          ]);

          setPosition([38.2481446, 21.7358758]);

          resolve([38.2481446, 21.7358758]);
        },
        (error) => {
          console.log(error);
          reject();
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );
    });

    return coords;
  };

  // Fetches the POI
  const asyncFetchPois = async (coords) => {
    const fetchResult = await axios
      .post("/poi-info/fetch-poi", {
        latitude: coords[0],
        longitude: coords[1],
        distance: 5000,
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    result.sort((x, y) => (x.name >= y.name ? 1 : -1));

    setPois(result);
  };

  // Fetches the POI categories
  const asyncFetchPoisCategories = async () => {
    const fetchResult = await axios
      .post("/poi-info/fetch-categories", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    result.sort((x, y) => (x.type >= y.type ? 1 : -1));

    setCategories(result);
  };

  // Handles the slider value change
  const handleSliderChange = (event, newValue) => {
    if (value !== newValue) {
      setValue(newValue);

      if (show) {
        getNearbyPoisAsync(newValue * 20);
      }
    }
  };

  // Fetches the nearby POI
  const getNearbyPoisAsync = async (distance) => {
    const fetchResult = await axios
      .post("/poi-info/fetch-poi", {
        latitude: position[0],
        longitude: position[1],
        distance: distance,
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    await getPopularityAsync(result);

    setNearbyPois(result);
  };

  // Removes nearby POI from the map
  const removeNearbyPois = () => {
    setShow(false);
  };

  // Gets all the nearby POIS
  const getNearbyPois = async () => {
    await getNearbyPoisAsync(value * 20);
    setShow(true);
  };

  // Gets all the POI that belong to a certain category
  const getPoisBasedOnCategoryAsync = async (input) => {
    const fetchResult = await axios
      .post("/poi-info/fetch-poi-based-on-category", {
        category: input,
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    await getPopularityAsync(result);

    setSearchedPois(result);
  };

  // Gets the information about the searched POI
  const getSearchedPoisInfo = async (input) => {
    await getPopularityAsync(input);
    setSearchedPois(input);
  };

  // Gets the popularity from popular_times table
  const getPopularityAsync = async (input) => {
    const dayIndex = dayAsInt();

    const fetchResult = await axios
      .post("/popular-times/fetch-poi-pop-times", {
        poi: input.map((item) => item.id),
        dayIndex: dayIndex,
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    // console.log(result);

    // result.forEach((item) => {
    //   item.popular_times.forEach((pop) => {
    //     if (pop !== 0) {
    //       console.log(item.poi_id);
    //     } else {
    //       console.log("no");
    //     }
    //   });
    // });

    await getAverageVisitsForSpecificPoisForPreviousTwoHours(input);

    input.forEach((item) => {
      const resultItem = result.find((x) => x.poi_id === item.id);
      item.popular_times = resultItem.popular_times;
    });
  };

  // Gets the average visits for specific POI for previous two hours
  const getAverageVisitsForSpecificPoisForPreviousTwoHours = async (input) => {
    const fetchResult = await axios
      .post(
        "/visits/fetch-average-visits-for-specific-poi-for-previous-two-hours",
        {
          poi: input.map((item) => item.id),
        }
      )
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    input.forEach((item) => {
      item.average = parseFloat(
        result.find((x) => x.poi_id === item.id).average
      );
    });
  };

  return (
    <React.Fragment>
      <Accordion sx={{ width: "100%" }} defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Search for nearby POI</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{ margin: "0px 0px 0px 0px" }}
          >
            <Typography
              sx={{ mr: "20px", fontSize: [15, "!important"] }}
              variant="body1"
              component="div"
            >
              {`Nearby POI circle radius (${value * 20} meters)`}
            </Typography>

            <Slider
              onChange={handleSliderChange}
              max={250}
              min={1}
              defaultValue={1}
              aria-label="Default"
              valueLabelDisplay="auto"
              sx={{ width: "40%" }}
            />
          </Grid>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              sx={{ margin: "15px 0px 0px 0px" }}
              variant="contained"
              color="custom"
              startIcon={!show ? <AddIcon /> : <RemoveIcon />}
              onClick={() => (!show ? getNearbyPois() : removeNearbyPois())}
            >
              {!show ? "Show" : "Hide"} nearby POI
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{ margin: "15px 0px", width: "100%" }}
        defaultExpanded={false}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Search for POI</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ padding: "0px 0px 15px 0px" }}>
            <Autocomplete
              disablePortal
              size="small"
              id="combo-box-demo"
              sx={{ width: "100%" }}
              options={[...new Set(allPois.map((item) => item.name))]}
              renderInput={(params) => (
                <TextField {...params} label="Search for point of interest" />
              )}
              onInputChange={(event, newInputValue) => {
                var result = allPois.filter((x) => x.name === newInputValue);

                if (result.length > 0) {
                  getSearchedPoisInfo(result);
                }
              }}
            />
          </Box>
          <Box sx={{ padding: "0px 0px 0px 0px" }}>
            <Autocomplete
              disablePortal
              size="small"
              id="combo-box-demo"
              sx={{ width: "100%" }}
              options={categories.map((item) => item.type)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for points of interest based on category"
                />
              )}
              onInputChange={(event, newInputValue) => {
                var result = categories.find((x) => x.type === newInputValue);

                if (result) {
                  getPoisBasedOnCategoryAsync(result.type);
                }
              }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <div className={styles.map_container}>
        <Map
          searchedPois={searchedPois}
          nearbyPois={nearbyPois}
          userRadius={value * 20}
          show={show}
          position={position}
        />
      </div>
    </React.Fragment>
  );
}

export default ClientMainSearch;
