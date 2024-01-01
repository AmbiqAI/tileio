import { FormGroup, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import Switch from '@mui/material/Switch';
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import { RJSFSchema } from "@rjsf/utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

const ButtonSchema: RJSFSchema = {
  type: "object",
  required: ["name", "enabled", "off", "on"],
  properties: {
    name: {
      type: "string",
      default: "Button",
      description: "Button Name",
    },
    enabled: {
      type: "boolean",
      default: false,
      description: "Enable Button",
    },
    off: {
      type: "string",
      default: "Off",
      description: "Off Label",
    },
    on: {
      type: "string",
      default: "On",
      description: "On Label",
    },
  }
};


export const UioTileSpec: TileSpec = {
  type: "UIO_TILE",
  name: "UIO Tile",
  description: "Control user I/O",
  streamingRequired: false,
  sizes: ["sm", "md"],
  schema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        default: "UIO",
        description: "Tile name",
      },
      btn0: {title: "Button 0", ...ButtonSchema},
      btn1: ButtonSchema,
      btn2: ButtonSchema,
      btn3: ButtonSchema,
    },
  },
};

export interface UioTileConfig {
  name: string;
  slot: number;
  btn0: {name: string, enabled: boolean, off: string, on: string};
  btn1: {name: string, enabled: boolean, off: string, on: string};
  btn2: {name: string, enabled: boolean, off: string, on: string};
  btn3: {name: string, enabled: boolean, off: string, on: string};
}

const UioTile = observer(({ size, config }: TileProps) => {
  const configs = config as UioTileConfig;
  const btnItems = [configs.btn0, configs.btn1, configs.btn2, configs.btn3];

  return (
    <GridContainer>
      <GridZStack level={0}>
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          sx={{
            p: 1.5,
            pt: 2
          }}
        >
    <FormGroup>
    <Grid container rowSpacing={1} columnSpacing={1}>
      {btnItems.map((btn, idx) => (
        <Grid xs={6} key={btn.name}>
          <Stack direction="column" alignItems="center">
          <Stack direction="row" alignItems="center">
            <Switch size="small" disabled={!btn.enabled} />
            <Typography variant="button" fontWeight={800} >
              {btn.on}
            </Typography>
          </Stack>
          <Typography variant="button">
            {btn.name}
          </Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
    </FormGroup>
        </Stack>
      </GridZStack>

      <GridZStack level={1} style={{pointerEvents: "none"}}>
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
            UIO
          </Typography>
        </Stack>
      </GridZStack>

    </GridContainer>
  );
});

export default UioTile;
