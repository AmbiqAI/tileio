import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { flow, Instance, SnapshotIn, types } from 'mobx-state-tree';
import { getApi } from '../api';
import { delay } from '../utils';

export enum UIOType {
  Toggle = 'Toggle',
  Slider = 'Slider',
  Select = 'Select'
}

export const IoSchema: RJSFSchema = {
  type: "object",
  required: ["name", "enabled", "direction", "ioType"],
  properties: {
    name: {
      type: "string",
      default: "I/O",
      description: "Display Name",
    },
    enabled: {
      type: "boolean",
      default: false,
      description: "Enable I/O",
    },
    direction: {
      "title": "Direction",
      "enum": [
        "Input",
        "Output",
      ]
    },
    ioType: {
      "title": "I/O Type",
      "enum": [
        UIOType.Toggle,
        UIOType.Slider,
        UIOType.Select
      ]
    }
  },
  allOf: [
    {
      if: {
        properties: {
          "ioType": {
            "const": UIOType.Toggle
          }
        }
      },
      then: {
        properties: {
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
      }
    },
    {
      if: {
        properties: {
          "ioType": {
            "const": UIOType.Slider
          }
        }
      },
      then: {
        properties: {
          min: {
            type: "integer",
            minimum: 0,
            maximum: 255
          },
          max: {
            type: "integer",
            minimum: 0,
            maximum: 255
          },
          step: {
            type: "integer",
            minimum: 0,
            maximum: 255
          },
          defaultValue: {
            type: "integer",
            minimum: 0,
            maximum: 255
          }
        }
      }
    },
    {
      if: {
        properties: {
          "ioType": {
            "const": UIOType.Select
          }
        }
      },
      then: {
        properties: {
          selectInputs: {
            type: "array",
            title: "Select Inputs",
            items: {
              type: "string",
            },
            minItems: 1,
            maxItems: 255
          },
        }
      }
    },
    {
      "required": [
        "inputType"
      ]
    }
  ]
};


export const IoConfig = types
  .model('IoConfig', {
    name: types.optional(types.string, 'Input'),
    enabled: types.optional(types.boolean, false),
    direction: types.optional(types.enumeration(['Input', 'Output']), 'Input'),
    ioType: types.optional(types.enumeration<UIOType>('UIOType', Object.values(UIOType)), UIOType.Toggle),
    off: types.optional(types.string, 'Off'),
    on: types.optional(types.string, 'On'),
    min: types.optional(types.number, 0),
    max: types.optional(types.number, 255),
    step: types.optional(types.number, 1),
    defaultValue: types.optional(types.number, 0),
    selectInputs: types.optional(types.array(types.string), []),
  });

export interface IIoConfig extends Instance<typeof IoConfig> { }
export interface IIoConfigSnapshot extends SnapshotIn<typeof IoConfig> { }

export const UioConfigSchema: { schema: RJSFSchema, uischema: UiSchema } = {
  schema: {
    type: "object",
    title: 'User IO',
    required: ["io0", "io1", "io2", "io3", "io4", "io5", "io6", "io7"],
    properties: {
      io0: {
        ...IoSchema,
        title: "I/O 0",
      },
      io1: {
        ...IoSchema,
        title: "I/O 1",
      },
      io2: {
        ...IoSchema,
        title: "I/O 2",
      },
      io3: {
        ...IoSchema,
        title: "I/O 3",
      },
      io4: {
        ...IoSchema,
        title: "I/O 4",
      },
      io5: {
        ...IoSchema,
        title: "I/O 5",
      },
      io6: {
        ...IoSchema,
        title: "I/O 6",
      },
      io7: {
        ...IoSchema,
        title: "I/O 7",
      },
    }
  },
  uischema: {}
};

export const UioConfig = types
  .model('UioConfig', {
    io0: types.optional(IoConfig, { name: 'I/O 0' }),
    io1: types.optional(IoConfig, { name: 'I/O 1' }),
    io2: types.optional(IoConfig, { name: 'I/O 2' }),
    io3: types.optional(IoConfig, { name: 'I/O 3' }),
    io4: types.optional(IoConfig, { name: 'I/O 4' }),
    io5: types.optional(IoConfig, { name: 'I/O 5' }),
    io6: types.optional(IoConfig, { name: 'I/O 6' }),
    io7: types.optional(IoConfig, { name: 'I/O 7' }),
  })
  .views(self => ({
    get list(): IIoConfig[] {
      return [
        self.io0,
        self.io1,
        self.io2,
        self.io3,
        self.io4,
        self.io5,
        self.io6,
        self.io7,
      ]
    }
  }))
  .actions(self => ({

  }));

export interface IUioConfig extends Instance<typeof UioConfig> { }
export interface IUioConfigSnapshot extends SnapshotIn<typeof UioConfig> { }


export const UioState = types
  .model('UioState', {
    id: types.string,
    io0: types.optional(types.number, 0),
    io1: types.optional(types.number, 0),
    io2: types.optional(types.number, 0),
    io3: types.optional(types.number, 0),
    io4: types.optional(types.number, 0),
    io5: types.optional(types.number, 0),
    io6: types.optional(types.number, 0),
    io7: types.optional(types.number, 0),
  })
  .views(self => ({
    get state(): number[] {
      return [
        self.io0,
        self.io1,
        self.io2,
        self.io3,
        self.io4,
        self.io5,
        self.io6,
        self.io7,
      ]
    }
  }))
  .actions(self => ({
    _setState(state: number[]) {
      self.io0 = state[0];
      self.io1 = state[1];
      self.io2 = state[2];
      self.io3 = state[3];
      self.io4 = state[4];
      self.io5 = state[5];
      self.io6 = state[6];
      self.io7 = state[7];
    },
  }))
  .actions(self => ({
    _pushState: flow(function*() {
      try {
      yield getApi().setUioState(self.id, self.state);
      yield delay(100);
      } catch (e) {
        console.error(e);
      }
    }),
    fetchState: flow(function*() {
      try {
        const state = yield getApi().getUioState(self.id);
        self._setState(state);
      } catch (e) {
        console.error(e);
      }
    })
  }))
  .actions(self => ({
    updateState: flow(function*(state: number[]) {
      if (state.length !== 8) {
        console.debug(`Invalid state length: ${state.length}`);
        return;
      }
      self.io0 = state[0];
      self.io1 = state[1];
      self.io2 = state[2];
      self.io3 = state[3];
      self.io4 = state[4];
      self.io5 = state[5];
      self.io6 = state[6];
      self.io7 = state[7];
      self._pushState();
    }),
    updateIoState: flow(function*(index: number, state: number) {
      switch (index) {
        case 0:
          self.io0 = state;
          break;
        case 1:
          self.io1 = state;
          break;
        case 2:
          self.io2 = state;
          break;
        case 3:
          self.io3 = state;
          break;
        case 4:
          self.io4 = state;
          break;
        case 5:
          self.io5 = state;
          break;
        case 6:
          self.io6 = state;
          break;
        case 7:
          self.io7 = state;
          break;
      }
      yield self._pushState();
    }),
  }));

export interface IUioState extends Instance<typeof UioState> { }
export interface IUioStateSnapshot extends SnapshotIn<typeof UioState> { }
