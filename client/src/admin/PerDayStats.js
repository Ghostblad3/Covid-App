import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS } from "chart.js/auto"; // eslint-disable-line no-unused-vars
import { Bar } from "react-chartjs-2";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button } from "@mui/material";
import Typography from "@mui/material/Typography";
import { startOfMonth } from "date-fns";
import { lastDayOfWeek } from "date-fns";
import { startOfWeekYear } from "date-fns";
import { format } from "date-fns";
import { add } from "date-fns";
import { endOfMonth } from "date-fns";
import styles from "./perdaystats.module.css";
const axios = require("axios").default;

const months = [
  { month: 1, name: "January" },
  { month: 2, name: "February" },
  { month: 3, name: "March" },
  { month: 4, name: "April" },
  { month: 5, name: "May" },
  { month: 6, name: "June" },
  { month: 7, name: "July" },
  { month: 8, name: "August" },
  { month: 9, name: "September" },
  { month: 10, name: "October" },
  { month: 11, name: "November" },
  { month: 12, name: "December" },
];

const weeks = Array(52)
  .fill()
  .map((_, i) => i + 1)
  .map(
    (item) =>
      [
        {
          week: item,
        },
      ][0]
  );

const typeOfStats = [
  { type: "Visits by users" },
  { type: "Visits by active cases" },
];

function formatDate(input) {
  return format(input, "yyyy-MM-dd HH:mm:ss");
}

function addDays(date, day) {
  return new Date(
    add(date, {
      days: day,
    })
  );
}

function addMonths(date, month) {
  return new Date(
    add(date, {
      months: month,
    })
  );
}

function getFirstAndLastDayOfSpecificWeek(index, year) {
  // first monday of the current year
  var firstday = new Date(
    startOfWeekYear(new Date(`${year}-01-10`), {
      weekStartsOn: 1, // we want the week to start with monday
    })
  );

  // If the first week contains dates from the previous year add 7 days
  if (firstday.getFullYear() === year - 1) {
    // we add 7 days to get the first week
    firstday = addDays(firstday, 7);
  }

  var first, last;

  if (index === 1) {
    first = formatDate(firstday);
    last = formatDate(new Date(lastDayOfWeek(firstday, { weekStartsOn: 1 })));
  } else {
    first = addDays(firstday, 7 * (index - 1));
    last = new Date(lastDayOfWeek(first, { weekStartsOn: 1 }));

    first = formatDate(first);
    last = formatDate(last);
  }

  return [first.split(" ")[0], last.split(" ")[0]];
}

function getFirstAndLastDayOfSpecificMonth(index, year) {
  var firstDay = new Date(startOfMonth(new Date(`${year}-01-10`)));
  var last;

  if (index === 1) {
    last = formatDate(endOfMonth(firstDay));
    firstDay = formatDate(firstDay);

    return [firstDay, last];
  } else {
    firstDay = addMonths(firstDay, index - 1);
    last = formatDate(endOfMonth(firstDay));
    firstDay = formatDate(firstDay);

    return [firstDay, last];
  }
}

function PerDayStats() {
  const navigate = useNavigate();
  // State that saves the visits of the users
  const [visitsByUsers, setVisitsByUsers] = useState([]);
  // State that saves the visits of the active cases
  const [visitsByActiveCases, setVisitsByActiveCases] = useState([]);
  // State that saves the index of the selected month
  const [month, setMonth] = useState(null);
  // State that saves the selected week
  const [week, setWeek] = useState("");
  // State that saves if the switch is checked/unchecked
  const [checked, setChecked] = useState(false);
  // State that saves the type of stats that will be displayed
  const [typeStats, setTypeStats] = useState("Visits by users");
  // State that saves if data can be displayed or not
  const [display, setDisplay] = useState(0);
  // State that saves the window width
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handler for switch checked/unchecked
  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  // Handler for month textfield value change
  const handleChangeMonth = (event) => {
    setMonth(event.target.value);
  };

  // Handler for week textfield value change
  const handleChangeWeek = (event) => {
    setWeek(event.target.value);
  };

  // Handler for type of stats textfield value change
  const handleChangeTypeStats = (event) => {
    setTypeStats(event.target.value);
  };

  // Handler for Load Stats button pressed
  const handleStatsLoad = async () => {
    if (!checked && month != null) {
      const selectedMonth = months.find((item) => item.name === month).month;

      const dates = getFirstAndLastDayOfSpecificMonth(
        selectedMonth,
        new Date().getFullYear()
      );

      if (typeStats === "Visits by users") {
        await getVisitsByUsersAsync(dates[0], dates[1]);
        setDisplay(1);
      } else {
        await getVisitsByActiveCasesAsync(dates[0], dates[1]);
        setDisplay(2);
      }
    } else if (week.length > 0) {
      const dates = week.toString().split(" - ");

      if (typeStats === "Visits by users") {
        await getVisitsByUsersAsync(dates[0], dates[1]);
        setDisplay(1);
      } else {
        await getVisitsByActiveCasesAsync(dates[0], dates[1]);
        setDisplay(2);
      }
    }
  };

  // Fetches visits by users async
  const getVisitsByUsersAsync = async (startDate, endDate) => {
    const fetchResult = await axios
      .post(
        "/visits-cases-stats/fetch-visits-for-specific-period-grouped-by-day",
        {
          startDate: startDate.split(" ")[0],
          endDate: endDate.split(" ")[0],
        }
      )
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    setVisitsByUsers(
      result.map(
        (item) =>
          [
            {
              number: item.number,
              date: formatDate(new Date(item.visit_date)).split(" ")[0],
            },
          ][0]
      )
    );
  };

  // Fetches visits by active cases async
  const getVisitsByActiveCasesAsync = async (startDate, endDate) => {
    const fetchResult = await axios
      .post(
        "/visits-cases-stats/fetch-visits-by-active-cases-for-specific-period-grouped-by-day",
        {
          startDate: startDate.split(" ")[0],
          endDate: endDate.split(" ")[0],
        }
      )
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    setVisitsByActiveCases(
      result.map(
        (item) =>
          [
            {
              number: item.number,
              date: formatDate(new Date(item.visit_date)).split(" ")[0],
            },
          ][0]
      )
    );
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
          sx={{ width: "100%", margin: "20px 0px 0px 0px" }}
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

        <TextField
          id="outlined-select-currency"
          select
          sx={{ margin: "20px 0px 20px 0px" }}
          label="Select month"
          value={month}
          onChange={handleChangeMonth}
        >
          {months.map((item) => (
            <MenuItem key={item.name} value={item.name}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>

        <div className={styles.week}>
          <TextField
            id="outlined-select-currency"
            select
            disabled={!checked}
            sx={{ width: "75%" }}
            label="Select week"
            value={week}
            onChange={handleChangeWeek}
          >
            {weeks.map((item) => (
              <MenuItem
                key={item.week}
                value={
                  getFirstAndLastDayOfSpecificWeek(
                    item.week,
                    new Date().getFullYear()
                  )[0] +
                  " - " +
                  getFirstAndLastDayOfSpecificWeek(
                    item.week,
                    new Date().getFullYear()
                  )[1]
                }
              >
                {getFirstAndLastDayOfSpecificWeek(
                  item.week,
                  new Date().getFullYear()
                )[0] +
                  " - " +
                  getFirstAndLastDayOfSpecificWeek(
                    item.week,
                    new Date().getFullYear()
                  )[1]}
              </MenuItem>
            ))}
          </TextField>

          <div style={{ flexGrow: "1" }}></div>

          <FormControlLabel
            sx={{ margin: "0px", padding: "0px" }}
            control={<Switch checked={checked} onChange={handleChange} />}
            label=""
          />
        </div>

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
              labels: visitsByUsers.map((item) =>
                item.date.substring(5, item.date.length)
              ),
              datasets: [
                {
                  label: `Visits by users in ${new Date().getFullYear()} (MM-dd)`,
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
              labels: visitsByActiveCases.map((item) =>
                item.date.substring(5, item.date.length)
              ),
              datasets: [
                {
                  label: `Visits by active cases in ${new Date().getFullYear()} (MM-dd)`,
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

export default PerDayStats;
