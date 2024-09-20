import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import { observer } from "mobx-react";
import { ThemeColors } from "../../theme/theme";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import NavButton from "../NavButton";
import QosDialog from "./QosDialog";
import { useState } from "react";
import { ISlot } from "../../models/slot";
import { IDashboard } from "../../models/dashboard";
import QosIcon from "./QosIcon";


interface Props {
  slots: ISlot[];
  dashboard: IDashboard;
  disabled?: boolean;
  size? : "small" | "medium";
}

const QosBarItem = ({ slots, dashboard, disabled, size }: Props) => {

  const [isDialogOpen, showDialog] = useState(false);
  const colors = ThemeColors.colors.slots;

  return (
    <>
      <NavButton
        onClick={() => { showDialog(true); }}
      >
        <Grid alignItems="center" container rowSpacing={0.5} columnSpacing={2} maxWidth="200px" height="100%">
          {dashboard.device.slots.map((config, idx) => (
            <Grid xs={6} key={`state-${idx}`}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={0}
              >
                <div
                  style={{
                    borderLeftStyle: "solid",
                    borderLeftWidth: "4px",
                    borderLeftColor: colors[idx % colors.length],
                    paddingLeft: "8px",
                  }}
                >
                  <Typography variant="button" fontWeight={700} pr="8px">
                    {`SLOT${idx + 1}`}
                  </Typography>
                </div>
                <QosIcon connected={config.enabled && !disabled} state={slots[idx].mask.qosState} fontSize="small" />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </NavButton>

      <QosDialog
        open={isDialogOpen}
        onClose={() => { showDialog(false); }}
        dashboard={dashboard}
        slots={slots}
      />
    </>

  );
};

QosBarItem.defaultProps = {
  size: "medium",
};

export default observer(QosBarItem);
