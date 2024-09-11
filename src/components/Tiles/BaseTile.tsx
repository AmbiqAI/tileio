import { Box } from "@mui/material";
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { IRecord } from "../../models/record";
import { IEventMarkerSnapshot } from "../../models/event";
import { ISlot } from "../../models/slot";
import { IUioState } from "../../models/uioState";
import { IDashboard } from "../../models/dashboard";

export type TileSize = "sm" | "md" | "lg";

export type TileProps = {
  name: string;
  type: string;
  size: TileSize;
  config?: { [key: string]: any};

  dashboard: IDashboard;
  slots: ISlot[];
  events?: IEventMarkerSnapshot[];
  pause?: boolean;
  duration?: number;
  record?: IRecord;
  uioState?: IUioState;
};

export type TileSpec = {
  type: string;
  name: string;
  description: string;
  sizes: TileSize[];
  schema: RJSFSchema;
  uischema?: UiSchema;
};

export const RegisteredTiles: Record<string, {spec: TileSpec, comp: (params: TileProps) => JSX.Element}> = {};


export const registerTile = (type: string, spec: TileSpec, comp: (params: TileProps) => JSX.Element) => {
  console.log(`Registering tile ${type}`);
  RegisteredTiles[type] = { spec, comp };
}

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
    sizes: ["sm", "md", "lg"],
    schema: {
      type: "object",
      properties: {},
    },
  };
}
