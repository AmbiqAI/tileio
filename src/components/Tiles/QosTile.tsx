import { Stack, Typography } from "@mui/material";
import { TileProps, TileSpec } from "./BaseTile";
import { observer } from "mobx-react";
import { ThemeColors } from "../../theme/theme";
import { GridContainer, GridZStack } from "./utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { QosIcon } from "../QosBarItem/QosBarItem";
import { getQoSName } from "../../models/slot";


export const QosTileSpec: TileSpec = {
  type: "QOS_TILE",
  name: "QOS Tile",
  description: "Provides slot QOS state",
  streamingRequired: false,
  sizes: ["sm", "md"],
  schema: {
    type: 'object',
    required: [],
    properties: {
      slots: {
        type: 'array',
        title: 'Slots',
        items: {
          type: "integer",
          enum: [ 0, 1, 2, 3 ]
        },
        uniqueItems: true
      }
    }
  },
  uischema: {
    "slots": {
      "ui:widget": "checkboxes",
      "ui:options": {
        "inline": true
      }
    },
  }
};


const QosTile = ({ pause, slots, device }: TileProps) => {
  const connected = !pause;

  const colors = ThemeColors.colors.slots;

  const slotStates = device.slots.map((slot, idx) => ({
    enabled: connected && idx < device.slots.length,
    state: idx < slots.length ? slots[idx].mask.qosState : 0,
    color: colors[idx % colors.length],
    name: slot.name.substring(0, 3)
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
        >
        {/* <Grid alignItems="center" container rowSpacing={0.5} columnSpacing={2} maxWidth="180px" height="100%">
          {slotStates.map((state, idx) => (
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
                    borderLeftColor: state.color,
                    paddingLeft: "8px",
                  }}
                >
                  <Typography variant="button" fontWeight={700} pr="8px">
                    {state.name}
                  </Typography>
                </div>
                <QosIcon connected={state.enabled} state={state.state} fontSize="small" />
              </Stack>
            </Grid>
          ))}
        </Grid> */}

      <Grid alignItems="center" container spacing={2} height="100%">
          {slotStates.map((state, idx) => (
            <Grid width="100%" xs={6} key={`state-${idx}`}>
              <Stack
                m={0}
                width="100%"
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <div
                  style={{
                    borderLeftStyle: "solid",
                    borderLeftWidth: "4px",
                    borderLeftColor: state.color,
                    paddingLeft: "8px",
                  }}
                >
                  <Typography variant="h6" fontWeight={800} pr="8px">
                    {state.name}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="button" fontWeight={800} pr="8px">
                    {getQoSName(state.enabled, state.state)}
                  </Typography>
                  <QosIcon connected={state.enabled} state={state.state} fontSize="medium" />
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>

      </Stack>
    </GridZStack>
    </GridContainer>
  );
};

export default observer(QosTile);
