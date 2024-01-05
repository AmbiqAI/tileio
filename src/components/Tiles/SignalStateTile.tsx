import { Stack, Typography } from "@mui/material";
import { TileProps, TileSpec } from "./BaseTile";
import DisconnectedIcon from '@mui/icons-material/SensorsOffRounded';
import ConnectIcon from '@mui/icons-material/SensorsRounded';
import { observer } from "mobx-react-lite";
import { ThemeColors } from "../../theme/theme";
import { GridContainer, GridZStack } from "./utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";


export const SignalStateSpec: TileSpec = {
  type: "SIGNALS_STATE_TILE",
  name: "Signals State Tile",
  description: "Provides connection state of signals",
  streamingRequired: false,
  sizes: ["sm"],
  schema: {
    type: 'object',
    required: ['slot'],
    properties: {
      slot: {
        type: 'integer',
        minimum: 0,
        maximum: 3,
        default: 0,
        description: 'Slot Index',
      }
    }
  },
};

export const getStateName = (connected: boolean, state: number) => {
  if (!connected) {
    return "OFF";
  } else if (state === 3) {
    return "GOOD";
  } else if (state === 2) {
    return "FAIR";
  } else if (state === 1) {
    return "POOR";
  }
  return "BAD";
}

export const getStateColor = (connected: boolean, state: number) => {
  if (!connected) {
    return "gray";
  } else if (state === 3) {
    return "#59f473";
  } else if (state === 2) {
    return "#f1f459";
  } else if (state === 1) {
    return "#f4a459";
  }
  return "#f16757";
}

export const SignalConnectionIcon = ({ connected, state, fontSize }: { connected: boolean, state: number, fontSize: "small" | "inherit" | "medium" | "large" }) => {
  let color = getStateColor(connected, state);
  let SignalIcon = connected || state ? ConnectIcon : DisconnectedIcon;
  return <SignalIcon fontSize={fontSize} htmlColor={color} />;
};


const SignalStateTile = observer(({ pause, slots }: TileProps) => {
  const connected = !pause;

  const colors = ThemeColors.colors.slots;

  const slotStates = slots.map((slot, idx) => ({
    state: slot.mask.qosState,
    color: colors[idx],
    name: `S${idx}`,
  }));

  return (
    <GridContainer>
    <GridZStack level={1}>
      <Stack
        width="100%"
        height="100%"
        alignItems="flex-end"
        justifyContent="flex-end"
        padding={0}
        sx={{
          userSelect: "none",
          WebkitUserSelect: "none",
          textAlign: "end",
          pr: 0.5,
          pb: 0.5,
        }}
      >
        <Typography fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
          QOS
        </Typography>
      </Stack>
    </GridZStack>

    <GridZStack level={1}>
      <Stack
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        p={1}
        >
        <Grid container spacing={1} width="100%" height="100%" pb={4}>
          {slotStates.map((state, idx) => (
          <Grid xs={6} key={`state-${idx}`}>
            <Stack
              direction="row"
              height="100%"
              justifyContent="center"
              alignItems="center"
              spacing={0}
            >
              <div
                style={{
                  borderLeftStyle: "solid",
                  borderLeftWidth: "4px",
                  borderLeftColor: state.color,
                  paddingLeft: "6px",
                }}
              >
                <Typography variant="h6" fontWeight={800} pr="4px">
                  {state.name}
                </Typography>
              </div>
              <SignalConnectionIcon connected={connected} state={state.state} fontSize="small" />
            </Stack>
          </Grid>
          ))}
        </Grid>
      </Stack>
    </GridZStack>
    </GridContainer>
  );
});

export default SignalStateTile;
