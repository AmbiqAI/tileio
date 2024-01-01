import { Stack, Typography } from "@mui/material";
import { TileProps, TileSpec } from "./BaseTile";
import DisconnectedIcon from '@mui/icons-material/SensorsOffRounded';
import ConnectIcon from '@mui/icons-material/SensorsRounded';
import { observer } from "mobx-react-lite";
import { ThemeColors } from "../../theme/theme";
import { GridContainer, GridZStack } from "./utils";

export const SignalStateSpec: TileSpec = {
  type: "SIGNALS_STATE_TILE",
  name: "Signals State Tile",
  description: "Provides connection state of signals",
  streamingRequired: false,
  sizes: ["sm", "md"],
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
  const ecgState = 0; // metrics.length > 1 ? metrics[metrics.length - 1].ecgState : 0;
  const ppgState = 0; //metrics.length > 1 ? metrics[metrics.length - 1].ppg1State : 0;
  const ppgStateName = getStateName(connected, ppgState);
  const ecgStateName = getStateName(connected, ecgState);
  const ecgColor = getStateColor(connected, ecgState);
  const ppgColor = getStateColor(connected, ppgState);
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
        <Typography fontWeight={700} variant="h4" sx={{ lineHeight: 1 }}>
          QOS
        </Typography>
      </Stack>
    </GridZStack>

    <GridZStack level={1}>
    <Stack
      direction="column"
      justifyContent="flex-start"
      height="100%"
      pt={1}
      pb={4}
      px={1}
      spacing={1}
    >
      <Stack
        direction="row"
        height="50%"
        justifyContent="space-between"
        alignItems="center"
      >
        <div
          style={{
            borderLeftStyle: "solid",
            borderLeftWidth: "8px",
            borderLeftColor: ThemeColors.colors.ecg,
            paddingLeft: "10px",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <Typography fontWeight={900} variant="h4" sx={{ lineHeight: 1 }} color={ecgColor}>
            {ecgStateName}
          </Typography>
          <Typography fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
            ECG
          </Typography>
        </div>
        <SignalConnectionIcon connected={connected} state={ecgState} fontSize="large" />
      </Stack>

      <Stack
        direction="row"
        height="50%"
        justifyContent="space-between"
        alignItems="center"
      >
        <div
          style={{
            borderLeftStyle: "solid",
            borderLeftWidth: "8px",
            borderLeftColor: ThemeColors.colors.ppg1,
            paddingLeft: "10px",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <Typography fontWeight={900} variant="h4" sx={{ lineHeight: 1 }} color={ppgColor}>
            {ppgStateName}
          </Typography>
          <Typography fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
            PPG
          </Typography>
        </div>
        <SignalConnectionIcon connected={connected} state={ppgState} fontSize="large" />
      </Stack>
    </Stack>
    </GridZStack>
    </GridContainer>
  );
});

export default SignalStateTile;
