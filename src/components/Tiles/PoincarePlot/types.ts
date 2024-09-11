import { TileSpec } from "../BaseTile";
import { ThemeColors } from "../../../theme/theme";

export const PoincarePlotSpec: TileSpec = {
  type: "POINCARE_PLOT",
  name: "Poincare Tile",
  description: "Poincare of fiducials",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'slot', 'ch', 'primaryColor', 'fiducial'],
    properties: {
      name: {
        type: 'string',
        default: 'Poincare',
        title: 'Name'
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
        title: 'Fiducial Mask',
        minimum: 0,
        maximum: 255,
        default: 0
      },
      primaryColor: {
        type: 'string',
        title: "Primary Color",
        default: ThemeColors.colors.primaryColor,
      },
      min: {
        type: 'number',
        title: 'Minimum Value',
      },
      max: {
        type: 'number',
        title: 'Maximum Value',
      },
      label: {
        type: 'string',
        title: 'Tile Label',
      },
      yTitle: {
        type: 'string',
        title: 'Y-axis Title',
      },
      title: {
        type: 'string',
        title: 'Plot Title',
      },
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
  label?: string;
  yTitle?: string;
  title?: string;
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
