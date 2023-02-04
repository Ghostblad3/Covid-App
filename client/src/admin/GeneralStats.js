import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { Chart as ChartJS } from "chart.js/auto"; // eslint-disable-line no-unused-vars
import { Pie, Bar } from "react-chartjs-2";
import styles from "./generalstats.module.css";
const axios = require("axios").default;

function GeneralStats() {
  const navigate = useNavigate();
  // State that saves the visits number
  const [visitsNumber, setVisitsNumber] = useState(0);
  // State that saves the cases number
  const [casesNumber, setCasesNumber] = useState(0);
  // State that saves the number of visits by active cases
  const [visitsNumberByActiveCases, setVisitsNumberByActiveCases] = useState(0);
  // Sate that saves the visits number grouped by category
  const [visitsNumberByGroupedByCategory, setVisitsNumberByGroupedByCategory] =
    useState([]);
  // State that saves the visits number grouped by category
  const [
    visitsNumberByActiveCasesGroupedByCategory,
    setVisitsNumberByActiveCasesGroupedByCategory,
  ] = useState([]);
  // State that saves the window width
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    getVisitsNumberAsync();
    getCasesNumberAsync();
    getVisitsNumberByActiveCasesAsync();
    getVisitsNumberGroupedByCategoryAsync();
    getVisitsNumberByActiveCasesGroupedByCategoryAsync();

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Gets the number of visits async
  const getVisitsNumberAsync = async () => {
    const fetchResult = await axios
      .post("/visits-cases-stats/fetch-visits-number", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    setVisitsNumber(result.number);
  };

  // Gets the number of cases async
  const getCasesNumberAsync = async () => {
    const fetchResult = await axios
      .post("/visits-cases-stats/fetch-user-cases-number", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    setCasesNumber(result.number);
  };

  // Gets the number of visits by active cases async
  const getVisitsNumberByActiveCasesAsync = async () => {
    const fetchResult = await axios
      .post("/visits-cases-stats/fetch-active-cases-visits-number", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    setVisitsNumberByActiveCases(result.number);
  };

  // Gets the number of visits grouped by category of POI async
  const getVisitsNumberGroupedByCategoryAsync = async () => {
    const fetchResult = await axios
      .post(
        "/visits-cases-stats/fetch-visits-number-grouped-by-poi-category",
        {}
      )
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    setVisitsNumberByGroupedByCategory(
      result.sort((x, y) => (x.number > y.number ? 1 : -1))
    );
  };

  // Gets the number of visits by active cases grouped by category of POI async
  const getVisitsNumberByActiveCasesGroupedByCategoryAsync = async () => {
    const fetchResult = await axios
      .post(
        "/visits-cases-stats/fetch-visits-by-active-cases-grouped-by-poi-category",
        {}
      )
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    setVisitsNumberByActiveCasesGroupedByCategory(
      result.sort((x, y) => (x.number > y.number ? 1 : -1))
    );
  };

  return (
    <div className={styles.stats_container}>
      <Typography
        sx={{ margin: "20px 0px", fontSize: "20px" }}
        variant="body1"
        gutterBottom
      >
        Total number of cases: {casesNumber}
      </Typography>

      {visitsNumber === 0 && (
        <Typography
          sx={{ margin: "20px 0px", fontSize: "20px" }}
          variant="body1"
          gutterBottom
        >
          Unfortunately there aren't any data on the server...
        </Typography>
      )}

      {visitsNumber > 0 && (
        <div className={styles.pie_chart}>
          <Pie
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
            data={{
              labels: [
                "Total visits",
                "Total visits by active cases",
                "Total cases",
              ],
              datasets: [
                {
                  label: "visits",
                  data: [visitsNumber, visitsNumberByActiveCases, casesNumber],
                  backgroundColor: [
                    "rgb(255, 99, 132)",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)",
                  ],
                  hoverOffset: 4,
                },
              ],
            }}
          ></Pie>
        </div>
      )}

      {visitsNumberByGroupedByCategory.length > 0 && (
        <div className={styles.bar_chart}>
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
              labels: visitsNumberByGroupedByCategory.map((item) => item.type),
              datasets: [
                {
                  label: "Total visits",
                  data: visitsNumberByGroupedByCategory.map(
                    (item) => item.number
                  ),
                  backgroundColor: ["#7985d3"],
                  barThickness: width >= 782 ? 10 : 3,
                },
              ],
            }}
          ></Bar>
        </div>
      )}

      {visitsNumberByActiveCasesGroupedByCategory.length > 0 && (
        <div className={styles.bar_chart}>
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
              labels: visitsNumberByActiveCasesGroupedByCategory.map(
                (item) => item.type
              ),
              datasets: [
                {
                  label: "Total visits by cases",
                  data: visitsNumberByActiveCasesGroupedByCategory.map(
                    (item) => item.number
                  ),
                  backgroundColor: ["#7985d3"],
                  barThickness: width >= 782 ? 10 : 3,
                },
              ],
            }}
          ></Bar>
        </div>
      )}
    </div>
  );
}

export default GeneralStats;
