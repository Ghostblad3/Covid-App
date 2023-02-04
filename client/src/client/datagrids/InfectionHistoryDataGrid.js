import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
const axios = require("axios").default;

const columns = [
  {
    field: "number",
    headerName: "Number",
    width: 100,
    editable: false,
  },
  {
    field: "date",
    headerName: "Date",
    width: 150,
    editable: false,
  },
];

function InfectionHistoryDataGrid() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  const getUserInfectionHistoryAsync = async () => {
    const fetchResult = await axios
      .post("/cases/fetch-user-cases", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    var final = [];
    var counter = result.length;

    result.forEach((item) => {
      final.push({
        number: counter,
        date: item.case_date.split("T")[0],
      });
      counter = counter - 1;
    });

    setRows(final.reverse());
  };

  useEffect(() => {
    getUserInfectionHistoryAsync();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        getRowId={(row) => row.number}
        getRowHeight={() => "auto"}
        rows={rows}
        columns={columns}
        //pageSize={20}
        //rowsPerPageOptions={[25]}
        disableSelectionOnClick
        //rowHeight={35}
      />
    </Box>
  );
}

export default InfectionHistoryDataGrid;
