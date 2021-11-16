import React from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';

const rows: GridRowsProp = [
  { id: 1, col1: 'ticket1', col2: 'ticket2' },
  { id: 2, col1: 'ticket3', col2: 'ticket4' },
  { id: 3, col1: 'ticket5', col2: 'ticket6' },
];

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'PENDING TICKETS', width: 200 },
  { field: 'col2', headerName: 'OTHER TICKETS', width: 200 },
];

function DataTable() {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
}

export default DataTable