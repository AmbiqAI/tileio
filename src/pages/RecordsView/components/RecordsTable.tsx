import { observer } from "mobx-react-lite";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowModel,
  GridValueFormatterParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridRowId,
  GridCallbackDetails,
  GridSortModel,
} from "@mui/x-data-grid";
import ViewRecordIcon from "@mui/icons-material/LaunchRounded";
import { Link as RouterLink } from "react-router-dom";
import { Button, Card, IconButton, Theme } from "@mui/material";
import { useStore } from "../../../models/store";
import { IRecord } from "../../../models/record";
import { useCallback, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmCountDialog from "../../../components/ConfirmCountDialog";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 100,
    sortable: false,
    hide: false,
    valueFormatter: (params: GridValueFormatterParams) =>
      `${(params.value as string).substring(0, 7)}`,
  },
  {
    field: "view",
    headerName: "View",
    width: 70,
    sortable: false,
    hide: false,
    filterable: false,
    disableExport: true,
    disableColumnMenu: true,
    hideSortIcons: true,
    renderCell: (params: GridRenderCellParams<string>) => (
      <strong>
        <IconButton component={RouterLink} to={`/records/${params.id}`}>
          <ViewRecordIcon />
        </IconButton>
      </strong>
    ),
  },
  { field: "date", headerName: "Date", minWidth: 200, type: "dateTime" },
  {
    field: "duration",
    headerName: "Duration",
    valueFormatter: (params) => Math.floor(params.value as number),
    minWidth: 100,
    type: "number",
  },
  { field: "deviceName", headerName: "Device", minWidth: 130 },
  {
    field: "deviceLocation",
    headerName: "Location",
    minWidth: 100,
    hide: true,
  },
];

function recordToRow(record: IRecord): GridRowModel {
  return {
    id: record.id,
    date: record.date,
    duration: record.duration,
    deviceName: record.device.name,
    deviceLocation: record.device.location
  };
}

const RecordsTable = () => {
  const {
    root: { records, removeRecord },
  } = useStore();
  const [confirmOptions, setConfirmOptions] = useState({
    title: "",
    count: 0,
    open: false,
  });
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
  const onConfirm = useCallback(async () => {
    const rowIds = [...selectedRows];
    for (const id of rowIds) {
      try {
        await removeRecord(id as string);
      } catch (error) {
        console.error(error);
      }
    }
    setSelectedRows([]);
  }, [removeRecord, selectedRows]);

  const dataRows = records.map((r) => recordToRow(r));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "date", sort: "desc" },
  ]);

  return (
    <Card
      elevation={1}
      sx={{ p: 1.5, borderRadius: 2, width: "100%", height: "70vh" }}
    >
      <div style={{ height: "100%" }}>
        <DataGrid
          rows={dataRows}
          columns={columns}
          pageSize={rowsPerPage}
          onPageSizeChange={(
            pageSize: number,
            details: GridCallbackDetails
          ) => {
            setRowsPerPage(pageSize);
          }}
          scrollbarSize={1}
          rowsPerPageOptions={[5, 10, 25]}
          checkboxSelection
          disableSelectionOnClick
          components={{
            Toolbar: () => (
              <GridToolbarContainer
                style={{
                  overflowX: "scroll",
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                <GridToolbarColumnsButton color="secondary" />
                <GridToolbarFilterButton
                  color="secondary"
                  sx={{ color: (theme: Theme) => theme.palette.secondary.main }}
                />
                <GridToolbarDensitySelector color="secondary" />
                <Button
                  variant="text"
                  size="small"
                  color="secondary"
                  disabled={selectedRows.length === 0}
                  onClick={async () => {
                    setConfirmOptions({
                      title: `Are you sure you want to delete ${selectedRows.length} record(s)?`,
                      count: selectedRows.length,
                      open: true,
                    });
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </GridToolbarContainer>
            ),
          }}
          onSelectionModelChange={(ids) => {
            setSelectedRows(ids);
          }}
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
        />
        <ConfirmCountDialog
          title={confirmOptions.title}
          count={confirmOptions.count}
          open={confirmOptions.open}
          setOpen={(open) =>
            setConfirmOptions((options) => ({ ...options, open }))
          }
          onConfirm={onConfirm}
        />
      </div>
    </Card>
  );
};

export default observer(RecordsTable);
