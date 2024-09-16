import { Card, Stack, Typography } from "@mui/material";
import { TileProps, TileSpec } from "./BaseTile";
import { observer } from "mobx-react";
import { ThemeColors } from "../../theme/theme";
import { GridContainer, GridZStack } from "./utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { styled } from "@mui/system";
import { getQoSName } from "../../models/slot";
import { useMemo } from "react";
import QosIcon from "../QosBarItem/QosIcon";
import TileCornerLabel from "./TileCornerLabel";

type ColoredDivProps = {
  animated?: boolean;
};

// Create styled div that animated font of text
export const ColoredDiv = styled("div") <ColoredDivProps>`

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
        default: [0],
        items: {
          type: "integer",
          enum: [0, 1, 2, 3]
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


const QosTile = ({ pause, slots, dashboard, config }: TileProps) => {
  const connected = !pause;

  const configs = useMemo(() => parseConfig(config || {}), [config]);

  const colors = ThemeColors.colors.slots;

  const slotStates = dashboard.device.slots.map((slot, idx) => ({
    enabled: connected && idx < dashboard.device.slots.length,
    state: idx < slots.length ? slots[idx].mask.qosState : 0,
    color: colors[idx % colors.length],
    name: slot.name.substring(0, 3)
  }));

  return (
    <GridContainer>

      <GridZStack level={1} style={{marginBottom: "20px"}}>
          <Grid alignItems="center" container spacing={1} padding={2} height="100%">
            {configs.slots.map((slotIdx) => {
              const slotConfig = dashboard.device.slots[slotIdx];
              const slot = slots[slotIdx];
              return (
                <Grid xs={12} xl={6} key={`qos-${slotIdx}`}>
                  <Stack
                    m={0}
                    width="100%"
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <div
                      style={{
                        borderLeftStyle: "solid",
                        borderLeftWidth: "4px",
                        borderLeftColor: colors[slotIdx % colors.length],
                        paddingLeft: "8px",
                      }}
                    >
                      <Typography variant="button" fontWeight={700} pr="8px">
                        {`SLOT${slotIdx + 1}`}
                      </Typography>
                    </div>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* <ColoredDiv animated={slot.mask.qosState <= 0}>
                        <Typography variant="body2" fontWeight={800} pr="8px">
                          {getQoSName(slotConfig.enabled && connected, slot.mask.qosState)}
                        </Typography>
                      </ColoredDiv> */}
                      <QosIcon connected={slotConfig.enabled} state={slot.mask.qosState} fontSize="medium" />
                    </Stack>
                  </Stack>
                </Grid>
              );
          })}
          </Grid>
      </GridZStack>

      <TileCornerLabel
        subheader="QoS"
        subheaderColor={ThemeColors.colors.secondaryColor}
      />
    </GridContainer>
  );
};

export default observer(QosTile);
