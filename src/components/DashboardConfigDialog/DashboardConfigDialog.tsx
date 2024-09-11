import { useState } from "react";
import { observer } from "mobx-react";
import SaveIcon from '@mui/icons-material/SaveAltRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
import OverviewIcon from '@mui/icons-material/WidgetsRounded';
import TileIcon from '@mui/icons-material/DashboardRounded';
import SlotsIcon from '@mui/icons-material/SchemaRounded';
import UioIcon from '@mui/icons-material/TuneRounded';
import CloseIcon from '@mui/icons-material/Close';
import { getSnapshot } from "mobx-state-tree";
import {
  Avatar,
  CardActions,
  CardHeader,
  DialogTitle,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
  Tooltip,
  Box,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import { IDashboard } from "../../models/dashboard";
import SlotsOverviewTab from "./SlotsOverviewTab";
import DashboardOverviewTab from "./DashboardOverviewTab";
import UioOverviewTab from "./UioOverviewTab";
import TilesTab from "./TilesTab";
import { TileioIcon } from "../../assets/icons";
import { shareJsonData } from "../utils";
import JsonUploadInput from "../JsonUploadInput";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = observer((props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
});


function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


interface Props {
  dashboard: IDashboard;
  open: boolean;
  onClose: () => void;
  disabled: boolean;
}

const DashboardConfigDialog = ({
  dashboard,
  open,
  onClose,
}: Props) => {

  const theme = useTheme();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="lg"
      onClose={() => {
        onClose();
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="settings"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <TileioIcon htmlColor={theme.palette.text.primary} fontSize="medium" />
            </Avatar>
          }
          action={
            <CardActions>
              <Tooltip title="Save config" placement="top">
                <IconButton
                  size="small"
                  onClick={async () => {
                    const json = getSnapshot(dashboard);
                    await shareJsonData(json, 'Dashboard Configuration', 'tio-dashboard-config.json')
                  }}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Upload config" placement="top">
                <IconButton
                  component="label"
                  size="small"
                >
                  <UploadIcon />
                  <JsonUploadInput
                    onSubmit={(json) => {
                      dashboard.copyFrom(json);
                    }}
                  />
                </IconButton>
              </Tooltip>

              <IconButton
                  aria-label="close"
                  onClick={onClose}
                >
                  <CloseIcon />
                </IconButton>

            </CardActions>
          }
          title="Dashboard Settings"
        />
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{ display: 'flex', height: "calc(62vh)" }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              sx={{ borderRight: 1, borderColor: 'divider', height: "100%" }}
              value={value}
              onChange={handleChange}
              aria-label="dashboard settings tabs"
            >
              <Tab icon={<OverviewIcon />} label="OVERVIEW" {...a11yProps(0)} />
              <Tab icon={<TileIcon />} label="TILES" {...a11yProps(1)} />
              <Tab icon={<SlotsIcon />} label="SLOTS" {...a11yProps(2)} />
              <Tab icon={<UioIcon />} label="I/O" {...a11yProps(3)} />
            </Tabs>
            {/* </Box> */}
            <Box sx={{ width: "100%", height: "100%", overflowY: "scroll" }}>
              <CustomTabPanel key="overview-tab" value={value} index={0}>
                <DashboardOverviewTab dashboard={dashboard} />
              </CustomTabPanel>
              <CustomTabPanel key="tiles-tab" value={value} index={1}>
                <TilesTab dashboard={dashboard} />
              </CustomTabPanel>
              <CustomTabPanel key="slots-tab" value={value} index={2}>
                <SlotsOverviewTab slots={dashboard.device.slots} />
              </CustomTabPanel>
              <CustomTabPanel key="io-tab" value={value} index={3}>
                <UioOverviewTab uio={dashboard.device.uio} />
              </CustomTabPanel>
            </Box>
          </Box>
      </DialogContent>
    </Dialog>
  );
};

export default observer(DashboardConfigDialog);
