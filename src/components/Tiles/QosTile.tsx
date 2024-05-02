import { Card, Stack, Typography } from "@mui/material";
import { TileProps, TileSpec } from "./BaseTile";
import { observer } from "mobx-react";
import { ThemeColors } from "../../theme/theme";
import { GridContainer, GridZStack } from "./utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { styled } from "@mui/system";
import { QosIcon } from "../QosBarItem/QosBarItem";
import { getQoSName } from "../../models/slot";
import { useMemo } from "react";

type ColoredDivProps = {
  animated?: boolean;
};

// Create styled div that animated font of text
export const ColoredDiv = styled("div")<ColoredDivProps>`

  @keyframes color-change {
    0% { color: ${ThemeColors.colors.tertiaryColor}; }
    50% { color: ${ThemeColors.colors.purple}; }
    100% { color: ${ThemeColors.colors.tertiaryColor}; }
  }
  animation: ${(props) => props.animated ? 'color-change 1s infinite' : 'none'};
}

`;

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
      name: {
        type: 'string',
        title: 'Name',
        default: 'QOS Tile'
      },
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

export interface QosTileConfig {
  name: string;
  slots: number[];
}

export function parseConfig(config: { [key: string]: any }): QosTileConfig {
  const configs = {
    name: "",
    slots: [],
    ...config
  } as QosTileConfig;
  return configs;
}


const QosTile = ({ pause, slots, device, config }: TileProps) => {
  const connected = !pause;

  const configs = useMemo(() => parseConfig(config || {}), [config]);

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
          alignItems="center"
          justifyContent="flex-start"
          padding={0}
          sx={{
            pt: 1.2,
          }}
        >
          <Typography fontWeight={700} variant="subtitle1" sx={{ lineHeight: 1 }}>
            {configs.name}
          </Typography>
        </Stack>
      </GridZStack>

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
      <Card
        elevation={0}
      >
      </Card>
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
                  <Typography variant="h5" fontWeight={800} pr="8px">
                    {state.name}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ColoredDiv animated={state.state <= 0}>
                  <Typography variant="h6" fontWeight={800} pr="8px">
                    {getQoSName(state.enabled, state.state)}
                  </Typography>
                  </ColoredDiv>
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
