import { useState } from "react";
import { observer } from "mobx-react";
import Typography from "@mui/material/Typography";
import { Button, IconButton, Toolbar, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddDashboardDialog from "../../../components/NewDashboardDialog";
import Header from "../../../components/Header";
import { TileioIcon } from "../../../assets/icons";

const DashboardsHeader = () => {
  const [isAddDashboardDialogOpen, showAddDashboardDialog] = useState(false);

  const theme = useTheme();
  return (
    <Header>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="secondary"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <TileioIcon htmlColor={theme.palette.text.primary} />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Tileio
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          aria-label="Add Device"
          size="large"
          component="span"
          onClick={async () => {
            showAddDashboardDialog(true);
          }}
        >
          <AddIcon />
        </Button>
      </Toolbar>
      <AddDashboardDialog
        open={isAddDashboardDialogOpen}
        close={() => {
          showAddDashboardDialog(false);
        }}
      />
    </Header>
  );
};

export default observer(DashboardsHeader);
