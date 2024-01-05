import { TileSpec } from "../BaseTile";
import { ThemeColors } from "../../../theme/theme";

export const PoincarePlotSpec: TileSpec = {
  type: "POINCARE_PLOT",
  name: "Poincare Tile",
  description: "Poincare of fiducials",
  streamingRequired: false,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'ch', 'primaryColor', 'fiducial'],
    properties: {
      name: {
        type: 'string',
        default: 'Poincare'
      },
      slot: {
        type: 'integer',
        enum: [0, 1, 2, 3],
        default: 0,
        title: 'Slot',
      },
      ch: {
        type: 'integer',
        enum: [0, 1, 2, 3],
        default: 0,
        title: 'Channel',
      },
      fiducial: {
        type: 'integer',
        title: 'Fiducial mask',
        minimum: 0,
        maximum: 255,
        default: 0
      },
      primaryColor: {
        type: 'string',
        title: "Primary color",
        default: ThemeColors.colors.primaryColor,
      },
      min: {
        type: 'number',
        title: 'Minimum value',
      },
      max: {
        type: 'number',
        title: 'Maximum value',
      }
    }
  },
  uischema: {
    "slot": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "ch": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "primaryColor": {
      "ui:widget": "color"
    },
  }
};

export interface PoincarePlotConfig {
  name: string;
  slot: number;
  ch: number;
  fiducial: number;
  primaryColor: string;
  min?: number;
  max?: number;
}

export function parseConfig(config: { [key: string]: any }): PoincarePlotConfig {
  const configs = {
    name: 'Poincare',
    slot: 0,
    ch: 0,
    fiducial: 0,
    primaryColor: ThemeColors.colors.primaryColor,
    ...config
  } as PoincarePlotConfig;
  return configs;
}
