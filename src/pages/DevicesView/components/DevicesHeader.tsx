import { useState } from "react";
import { observer } from "mobx-react-lite";
import Typography from "@mui/material/Typography";
import { Button, IconButton, Toolbar, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddDeviceDialog from "../../../components/AddDeviceDialog/AddDeviceDialog";
import Header from "../../../components/Header";
import { useStore } from "../../../models/store";
import { TileioIcon, ScanIcon } from "../../../assets/icons";
import { ScanButton } from "../../../components/ScanButton";

const DevicesHeader = () => {
  const { root: { fetching, refreshDevices } } = useStore();
  const [isAddDeviceDialogOpen, showAddDeviceDialog] = useState(false);
  const performScan = async () => {
    await refreshDevices();
  };
  const theme = useTheme();
  return (
    <Header>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          // color="inherit"
          color="secondary"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <TileioIcon htmlColor={theme.palette.text.primary} />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Tileio
        </Typography>
        <ScanButton
          disableRipple
          disabled={fetching}
          sx={{ mr: 1 }}
          size="large"
          variant="outlined"
          onClick={performScan}
          scanning={fetching ? "true" : undefined}
        >
          <ScanIcon />
        </ScanButton>
        <Button
          variant="outlined"
          color="primary"
          aria-label="Add Device"
          size="large"
          component="span"
          onClick={async () => {
            showAddDeviceDialog(true);
            // await fetchDevices();
          }}
        >
          <AddIcon />
        </Button>
      </Toolbar>
      <AddDeviceDialog
        open={isAddDeviceDialogOpen}
        close={() => {
          showAddDeviceDialog(false);
        }}
      />
    </Header>
  );
};

export default observer(DevicesHeader);
