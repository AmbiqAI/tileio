import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import ArchiveIcon from "@mui/icons-material/Archive";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/CloseRounded";
import { TileioIcon } from "../assets/icons";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { Theme, useTheme } from "@mui/material";

function SpeedDialNav() {
  const theme = useTheme();
  const history = useHistory();
  const actions = useMemo(() => {
    return [
      {
        name: "Devices",
        icon: <TileioIcon color="primary" htmlColor={theme.palette.primary.main} sx={{ fontSize: "28px" }} />,
        onClick: () => { history.push("/devices");}
      },
      {
        name: "Records",
        icon: <ArchiveIcon color="primary" sx={{ fontSize: "28px" }} />,
        onClick: () => { history.push("/records");}
      },
      {
        name: "Settings",
        icon: <SettingsIcon color="primary" sx={{ fontSize: "28px" }} />,
        onClick: () => { history.push("/settings");}
      },
    ];
  }, [theme, history]);
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);
  const handleClose = () => setOpen(false);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <SpeedDial
        open={open}
        onClick={toggleOpen}
        ariaLabel="SpeedDial"
        FabProps={{ color: "secondary" }}
        sx={{
          position: "fixed",
          bottom: 24,
          pb: 1,
          right: 24,
          zIndex: 1101,
        }}
        icon={<SpeedDialIcon icon={<TileioIcon />} openIcon={<CloseIcon/>} />}
      >
        {/* First action flickers on safari due to transition time of 0ms. Add dummy */}
        <SpeedDialAction
          sx={{
            display: "none",
            width: 0,
            height: 0,
            p: 0,
            mx: 0,
            mb: 0,
            mt: "-27px",
          }}
        />
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            onClick={action.onClick}
            FabProps={{
              size: "large",
            }}
            sx={{
              "& .MuiSpeedDialAction-staticTooltipLabel": {
                color: (theme: Theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.common.white
                    : theme.palette.common.white,
                backgroundColor: (theme: Theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.background.paper
                    : theme.palette.primary.main,
              },
            }}
            tooltipOpen
            tooltipTitle={action.name}
          />
        ))}
      </SpeedDial>
    </ClickAwayListener>
  );
}

export default SpeedDialNav;
