import { observer } from "mobx-react-lite";
import {
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import RecordsIcon from "@mui/icons-material/Inventory";
import ListViewIcon from "@mui/icons-material/FormatListBulletedRounded";
import GridViewIcon from "@mui/icons-material/AppsRounded";
import Header from "../../../components/Header";
import { useState } from "react";

export enum RecordsViewMode {
  gridView = "gridView",
  listView = "listView",
}

const RecordsHeader = () => {
  const [viewMode, setViewMode] = useState<RecordsViewMode>(
    RecordsViewMode.listView
  );
  const handleChangeViewMode = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: RecordsViewMode | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  return (
    <Header>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <RecordsIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Records
        </Typography>

        <ToggleButtonGroup
          value={viewMode}
          color="primary"
          exclusive
          onChange={handleChangeViewMode}
          aria-label="View Mode"
        >
          <ToggleButton value={RecordsViewMode.listView} aria-label="List View">
            <ListViewIcon />
          </ToggleButton>
          <ToggleButton value={RecordsViewMode.gridView} aria-label="Grid View">
            <GridViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>
    </Header>
  );
};

export default observer(RecordsHeader);
