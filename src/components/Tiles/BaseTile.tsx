import { Box } from "@mui/material";
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { IRecord } from "../../models/record";
import { IEventMarkerSnapshot } from "../../models/event";
import { ISlot } from "../../models/slot";
import { IDeviceInfo } from "../../models/deviceInfo";
import { IUioState } from "../../models/uioState";

export type TileSize = "sm" | "md" | "lg";

export type TileProps = {
  name: string;
  type: string;
  size: TileSize;
  device: IDeviceInfo;
  slots: ISlot[];
  events?: IEventMarkerSnapshot[];
  pause?: boolean;
  duration?: number;
  record?: IRecord;
  config?: { [key: string]: any};
  uioState?: IUioState;
};

export type TileSpec = {
  type: string;
  name: string;
  description: string;
  streamingRequired?: boolean;
  sizes: TileSize[];
  schema: RJSFSchema;
  uischema?: UiSchema;
};

export const RegisteredTiles: Record<string, {spec: TileSpec, comp: (params: TileProps) => JSX.Element}> = {};


export const registerTile = (type: string, spec: TileSpec, comp: (params: TileProps) => JSX.Element) => {
  console.log(`Registering tile ${type}`);
  RegisteredTiles[type] = { spec, comp };
}


export const tileRequiresStreaming = (type: string): boolean => {
  return RegisteredTiles[type]?.spec.streamingRequired || false;
};

export const BaseTile = ({ type }: TileProps) => {
  return (
    <Box
      p={2}
      width="100%"
      height="100%"
      justifyContent="center"
      alignContent="center"
      sx={{ textAlign: "center" }}
    >
      {`No Tile Handler found for type ${type}.`}
    </Box>
  );
};

export const InvalidTileSpec = (type: string): TileSpec => {
  return {
    type: type,
    name: "Invalid Tile",
    description: "Tile type doesnt exist",
    streamingRequired: false,
    sizes: ["sm", "md", "lg"],
    schema: {
      type: "object",
      properties: {},
    },
  };
}
