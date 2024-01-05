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
  sizes: ["sm"],
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

const UioTile = observer(({ size, config, device, uioState }: TileProps) => {
  const configs = config as UioTileConfig;

  const btnItems = [{
    info: configs.btn0,
    state: uioState ? uioState.btn0 : false,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      uioState?.setButtonState(0, event.target.checked);
    }
  }, {
    info: configs.btn1,
    state: uioState ? uioState.btn1 : false,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      uioState?.setButtonState(1, event.target.checked);
    }
  }, {
    info: configs.btn2,
    state: uioState ? uioState.btn2 : false,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      uioState?.setButtonState(2, event.target.checked);
    }
  }, {
    info: configs.btn3,
    state: uioState ? uioState.btn3 : false,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      uioState?.setButtonState(3, event.target.checked);
    }
  }];

  return (
    <GridContainer>
      <GridZStack level={0}>
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          p={1}
        >
          <FormGroup>
          <Grid container spacing={1} width="100%" height="100%" pb={4}>
            {btnItems.map((btn, idx) => (
              <Grid xs={6} key={`btn-${btn.info.name}-${idx}`}>
                <Stack direction="column" alignItems="center">
                <Stack direction="row" alignItems="center">
                  <Switch
                    checked={btn.state}
                    onChange={btn.onChange}
                    size="small"
                    disabled={!btn.info.enabled || !uioState} />
                  <Typography variant="button" fontWeight={800} >
                    {btn.state ? btn.info.on: btn.info.off}
                  </Typography>
                </Stack>
                <Typography variant="button">
                  {btn.info.name}
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
