import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS } from "chart.js/auto"; // eslint-disable-line no-unused-vars
import Paper from "@mui/material/Paper";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Bar } from "react-chartjs-2";
import { format } from "date-fns";
import styles from "./perhourstats.module.css";

const axios = require("axios").default;

const typeOfStats = [
  { type: "Visits by users" },
  { type: "Visits by active cases" },
];

function formatDate(input) {
  return format(input, "yyyy-MM-dd");
}

function PerHourStats() {
  const navigate = useNavigate();
  // State that saves the selected date
  const [value, setValue] = useState(formatDate(new Date()));
  // State that saves the selected date(copy)
  const [valueCopy, setValueCopy] = useState(formatDate(new Date()));
  // State that saves the type of data that will be displayed
  const [typeStats, setTypeStats] = useState("Visits by users");
  // State that saves if data can be displayed or not
  const [display, setDisplay] = useState(0);
  // State that saves the visits by users
  const [visitsByUsers, setVisitsByUsers] = useState([]);
  // State that saves the visits by active cases
  const [visitsByActiveCases, setVisitsByActiveCases] = useState([]);
  // State that saves the window width
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handler for DesktopDatePicker value change
  const handleChange = (newValue) => {
    setValue(formatDate(new Date(newValue)));
  };

  // Handler for type text field value change
  const handleChangeTypeStats = (event) => {
    setTypeStats(event.target.value);
  };

  // Handler for Load stats button pressed
  const handleStatsLoad = async () => {
    setValueCopy(value);

    if (typeStats === "Visits by users") {
      await getVisitsByUserAsync();
      setDisplay(1);
    } else {
      await getVisitsByActiveCasesAsync();
      setDisplay(2);
    }
  };

  // Fetches user data async
  const getVisitsByUserAsync = async () => {
    const fetchResult = await axios
      .post(
        "/visits-cases-stats/fetch-visits-for-specific-day-grouped-by-hour",
        {
          date: value,
        }
      )
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    if (result.length > 0) {
      var final = [];

      // All visits start from 6am in the database so we iterate from 0 to 23 to add to the missing ones
      for (var i = 0; i < 24; i++) {
        // eslint-disable-next-line
        const item = result.find((x) => x.hour === i);

        if (item) {
          final.push(item);
        } else {
          final.push({
            hour: i,
            number: 0,
          });
        }
      }

      final.forEach((item) => (item.hour = item.hour + 1));
      setVisitsByUsers(final);
    } else {
      setVisitsByUsers([]);
    }
  };

  // Fetches visits by active cases
  const getVisitsByActiveCasesAsync = async () => {
    const fetchResult = await axios
      .post(
        "/visits-cases-stats/fetch-visits-by-active-cases-for-specific-day-grouped-by-hour",
        {
          date: value,
        }
      )
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    if (result.length > 0) {
      var final = [];

      // All visits start from 6am in the database so we iterate from 0 to 23 to add to the missing ones
      for (var i = 0; i < 24; i++) {
        // eslint-disable-next-line
        const item = result.find((x) => x.hour === i);

        if (item) {
          final.push(item);
        } else {
          final.push({
            hour: i,
            number: 0,
          });
        }
      }

      final.forEach((item) => (item.hour = item.hour + 1));
      setVisitsByActiveCases(final);
    } else {
      setVisitsByActiveCases([]);
    }
  };

  return (
    <Paper
      sx={{ width: "100%", height: "100%" }}
      className={styles.paper}
      elevation={0}
    >
      <div className={styles.paper_top}>
        <TextField
          id="outlined-select-currency"
          select
          sx={{ width: "100%", margin: "20px 0px 20px 0px" }}
          label="Select type of stats"
          value={typeStats}
          onChange={handleChangeTypeStats}
        >
          {typeOfStats.map((item) => (
            <MenuItem key={item.type} value={item.type}>
              {item.type}
            </MenuItem>
          ))}
        </TextField>

        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DesktopDatePicker
            label="Select date"
            inputFormat="YYYY/MM/DD"
            size="small"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>

        <Button
          sx={{ margin: "20px 0px" }}
          variant="contained"
          onClick={() => handleStatsLoad()}
          color="custom"
        >
          Load stats
        </Button>
      </div>

      <div className={styles.bar}>
        {visitsByUsers.length > 0 && display === 1 ? (
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
              labels: visitsByUsers.map((item) => item.hour),
              datasets: [
                {
                  label: `Visits by users on ${valueCopy}`,
                  data: visitsByUsers.map((item) => item.number),
                  backgroundColor: ["#7985d3"],
                  barThickness: width >= 954 ? 10 : 3,
                },
              ],
            }}
          ></Bar>
        ) : (
          display === 1 && (
            <Typography
              sx={{
                margin: "20px 0px",
                fontSize: "20px",
                textAlign: "center",
              }}
              variant="body1"
              gutterBottom
            >
              No data to display...
            </Typography>
          )
        )}

        {visitsByActiveCases.length > 0 && display === 2 ? (
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
              labels: visitsByActiveCases.map((item) => item.hour),
              datasets: [
                {
                  label: `Visits by active cases on ${valueCopy}`,
                  data: visitsByActiveCases.map((item) => item.number),
                  backgroundColor: ["#7985d3"],
                  barThickness: width >= 954 ? 10 : 3,
                },
              ],
            }}
          ></Bar>
        ) : (
          display === 2 && (
            <Typography
              sx={{
                margin: "20px 0px",
                fontSize: "20px",
                textAlign: "center",
              }}
              variant="body1"
              gutterBottom
            >
              No data to display...
            </Typography>
          )
        )}
      </div>
    </Paper>
  );
}

export default PerHourStats;
