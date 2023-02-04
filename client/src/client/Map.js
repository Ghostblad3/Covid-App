import React, { useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayerGroup,
  Circle,
} from "react-leaflet";
import { useMap } from "react-leaflet/hooks";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import VisitDialog from "./VisitDialog";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Chart as ChartJS } from "chart.js/auto"; // eslint-disable-line no-unused-vars
import { Bar } from "react-chartjs-2";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import styles from "./map.module.css";
var haversine = require("haversine-distance");

function getDistanceInKM(pointA, pointB) {
  return haversine(pointA, pointB) / 1000;
}

function getIconForSearchedPois(currentPopularity, iconSize) {
  if (currentPopularity < 33) {
    return L.icon({
      iconUrl: require("./icons/green.png"),
      iconSize: [iconSize, iconSize],
    });
  } else if (currentPopularity < 66) {
    return L.icon({
      iconUrl: require("./icons/orange.png"),
      iconSize: [iconSize, iconSize],
    });
  } else
    return L.icon({
      iconUrl: require("./icons/red.png"),
      iconSize: [iconSize, iconSize],
    });
}

function getIcon(type, iconSize) {
  if (type === "self") {
    return L.icon({
      iconUrl: require("./icons/black.png"),
      iconSize: [iconSize, iconSize],
    });
  } else if (type === "nearby") {
    return L.icon({
      iconUrl: require("./icons/blue.png"),
      iconSize: [iconSize, iconSize],
    });
  }
}

function getHourIndex() {
  const date = new Date();

  return date.getHours();
}

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Function for changing the start center of the map
function ChangeMapView({ coords }) {
  const map = useMap();
  map.setView(coords, map.getZoom());

  return null;
}

function Map({ searchedPois, nearbyPois, userRadius, show, position }) {
  // Handles the VisitDialog open/close state
  const [open, setOpen] = useState(false);
  // State that saves the selected POI Id
  const [selectedPoiId, setSelectedPoiId] = useState("");
  // State that handles the open/close of the snackbar
  const [openSnackBar, setOpenSnackbar] = useState(false);

  // Handles the close of the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  // VisitDialog close handler
  const handleClose = (value) => {
    setOpen(false);
  };

  // VisitDialog open handler
  const handleAddVisit = () => {
    setOpen(true);
  };

  return (
    <React.Fragment>
      <MapContainer
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        center={position}
        zoom={12}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView coords={position} />

        {position[0] !== "" && position[1] !== "" && (
          <LayerGroup>
            <Circle
              center={position}
              pathOptions={{ fillColor: "blue" }}
              radius={5000}
            />
            <Circle
              center={position}
              pathOptions={{ fillColor: "black", color: "red" }}
              radius={userRadius}
            />
          </LayerGroup>
        )}

        {position[0] !== "" && position[1] !== "" && (
          <Marker position={position} icon={getIcon("self", 30)}>
            <Popup className={styles.request_popup}>
              <div className={styles.name_text}>
                <Typography
                  className={styles.map_popup_typography}
                  variant="subtitle1"
                  gutterBottom
                  component="div"
                >
                  My position
                  <Divider />
                </Typography>
              </div>
              <Typography
                className={styles.map_popup_typography}
                variant="subtitle1"
                gutterBottom
                component="div"
              >
                Latitude: {position[0]}
                <Divider />
                Longitude: {position[1]}
              </Typography>
            </Popup>
          </Marker>
        )}

        {position[0] !== "" &&
          position[1] !== "" &&
          searchedPois.length > 0 &&
          searchedPois.map((item) => {
            return (
              <Marker
                key={item.name + item.address}
                position={[item.latitude, item.longitude]}
                icon={getIconForSearchedPois(
                  item.popular_times[getHourIndex()],
                  30
                )}
              >
                <Popup className={styles.popup}>
                  <div className={styles.popup_content}>
                    <div className={styles.name_text}>
                      <Typography
                        className={styles.map_popup_typography}
                        // sx={{fontSize: [17, "!important"],}}
                        variant="subtitle1"
                        gutterBottom
                        component="div"
                      >
                        {item.name}
                        <Divider />
                      </Typography>
                    </div>

                    <Typography
                      className={styles.map_popup_typography}
                      variant="subtitle1"
                      gutterBottom
                      component="div"
                    >
                      Address: {item.address}
                      <Divider />
                      Latitude: {item.latitude}
                      <Divider />
                      Longitude: {item.longitude}
                      <Divider />
                      Average visitors (last 2 hours):{" "}
                      {parseInt(item.average) === item.average
                        ? item.average
                        : `${Math.floor(item.average)} - ${
                            Math.floor(item.average) + 1
                          }`}
                      <Divider />
                      <div className={styles.popularity_diagram}>
                        <Bar
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              x: {
                                grid: {
                                  display: false,
                                },
                              },
                              y: {
                                grid: {
                                  display: false,
                                },
                              },
                            },
                          }}
                          data={{
                            labels: Array.from({ length: 24 }, (_, i) => i + 1),
                            datasets: [
                              {
                                label: "Popularity",
                                data: item.popular_times,
                                backgroundColor: ["#7985d3"],
                                // barThickness: 10,
                                barPercentage: 1.2,
                                categoryPercentage: 0.7,
                                borderRadius: 2,
                              },
                            ],
                          }}
                        ></Bar>
                      </div>
                    </Typography>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        {position[0] !== "" &&
          position[1] !== "" &&
          nearbyPois &&
          show &&
          nearbyPois.map((item) => {
            return (
              <Marker
                key={item.name + item.address}
                position={[item.latitude, item.longitude]}
                icon={getIcon("nearby", 30)}
              >
                <Popup className={styles.popup}>
                  <div className={styles.popup_content}>
                    <div className={styles.name_text}>
                      <Typography
                        className={styles.map_popup_typography}
                        variant="subtitle1"
                        gutterBottom
                        component="div"
                      >
                        {item.name}
                        <Divider />
                      </Typography>
                    </div>
                    <Typography
                      className={styles.map_popup_typography}
                      variant="subtitle1"
                      gutterBottom
                      component="div"
                    >
                      {"Address: "}
                      {item.address}
                      <Divider />
                      {"Latitude: "}
                      {item.latitude}
                      <Divider />
                      {"Longitude: "}
                      {item.longitude}
                      <Divider />
                      {"Average visitors (last 2 hours): "}
                      {parseInt(item.average) === item.average
                        ? item.average
                        : `${Math.floor(item.average)} - ${
                            Math.floor(item.average) + 1
                          }`}
                      <Divider />
                    </Typography>
                    <Button
                      sx={{ width: "100%", margin: "5px 0px 10px 0px" }}
                      variant="contained"
                      color="custom"
                      size="small"
                      disabled={
                        getDistanceInKM(
                          { lat: position[0], lng: position[1] },
                          { lat: item.latitude, lng: item.longitude }
                        ) > 0.02
                      }
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedPoiId(item.id);
                        handleAddVisit();
                      }}
                    >
                      Add visit intention
                    </Button>
                    <Divider />
                    <div className={styles.popularity_diagram}>
                      <Bar
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            x: {
                              grid: {
                                display: false,
                              },
                            },
                            y: {
                              grid: {
                                display: false,
                              },
                            },
                          },
                        }}
                        data={{
                          labels: Array.from({ length: 24 }, (_, i) => i + 1),
                          datasets: [
                            {
                              label: "Popularity",
                              data: item.popular_times,
                              backgroundColor: ["#7985d3"],
                              // barThickness: 10,
                              barPercentage: 1.2,
                              categoryPercentage: 0.7,
                              borderRadius: 2,
                            },
                          ],
                        }}
                      ></Bar>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      <VisitDialog
        open={open}
        onClose={handleClose}
        selectedPoiId={selectedPoiId}
        setOpenSnackbar={setOpenSnackbar}
      />
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
          {"Successfully added the visit!"}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export default Map;
