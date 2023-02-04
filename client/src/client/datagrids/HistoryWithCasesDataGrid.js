import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";

const axios = require("axios").default;

const columns = [
  {
    field: "name",
    headerName: "POI Name",
    width: 350,
    editable: false,
  },
  {
    field: "address",
    headerName: "Address",
    width: 250,
    editable: false,
  },
  {
    field: "visit_timestamp",
    headerName: "Visit timestamp",
    width: 170,
    editable: false,
  },
];

function formatDate(input) {
  return format(input, "yyyy-MM-dd HH:mm:ss");
}

function HistoryWithCasesDataGrid() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  const getUserHistoryAsync = async () => {
    const fetchResult = await axios
      .post("/contact-with-cases/fetch-contacts-with-cases", {})
      .then((response) => response.data)
      .catch((error) => console.log(error));

    if (!fetchResult.hasAccessPermission) {
      navigate("/");
    }

    const result = fetchResult.data;

    result.forEach(
      (item) =>
        (item.visit_timestamp = formatDate(new Date(item.visit_timestamp)))
    );

    result.sort((x, y) => (x.visit_timestamp <= y.visit_timestamp ? 1 : -1));

    setRows(result);
  };

  useEffect(() => {
    getUserHistoryAsync();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <DataGrid
        getRowId={(row) => row.visit_timestamp}
        getRowHeight={() => "auto"}
        rows={rows}
        columns={columns}
        //pageSize={20}
        //rowsPerPageOptions={[25]}
        disableSelectionOnClick
        // rowHeight={35}
      />
    </Box>
  );
}

export default HistoryWithCasesDataGrid;
