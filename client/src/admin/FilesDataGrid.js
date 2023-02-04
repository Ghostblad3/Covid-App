import React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "name",
    headerName: "File name",
    width: 380,
    editable: false,
  },
];

function FilesDataGrid({ files }) {
  return (
    <Box sx={{ height: "300px", maxWidth: "400px", minWidth: "200px" }}>
      <DataGrid
        getRowId={(row) => row.name}
        rows={files.map((item) => [{ name: item }][0])}
        columns={columns}
        //pageSize={10}
        //rowsPerPageOptions={[25]}
        getRowHeight={() => "auto"}
        disableSelectionOnClick
      />
    </Box>
  );
}

export default FilesDataGrid;
