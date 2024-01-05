import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Instance, SnapshotIn, types } from 'mobx-state-tree';

export const ButtonSchema: RJSFSchema = {
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

export const LedSchema: RJSFSchema = {
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

export const BtnConfig = types
.model('BtnConfig', {
  name: types.optional(types.string, 'Button'),
  enabled: types.optional(types.boolean, false),
  off: types.optional(types.string, 'Off'),
  on: types.optional(types.string, 'On'),
});

export interface IBtnConfig extends Instance<typeof BtnConfig> {}
export interface IBtnConfigSnapshot extends SnapshotIn<typeof BtnConfig> {}

export const LedConfig = types
.model('LedConfig', {
  name: types.optional(types.string, 'Button'),
  enabled: types.optional(types.boolean, false),
  off: types.optional(types.string, 'Off'),
  on: types.optional(types.string, 'On'),
})

export interface ILedConfig extends Instance<typeof LedConfig> {}
export interface ILedConfigSnapshot extends SnapshotIn<typeof LedConfig> {}


export const UioConfigSchema: {schema: RJSFSchema, uischema: UiSchema} = {
  schema: {
    type: "object",
    title: 'User IO',
    required: ["btn0", "btn1", "btn2", "btn3", "led0", "led1", "led2", "led3"],
    properties: {
      btn0: ButtonSchema,
      btn1: ButtonSchema,
      btn2: ButtonSchema,
      btn3: ButtonSchema,
      led0: LedSchema,
      led1: LedSchema,
      led2: LedSchema,
      led3: LedSchema,
    }
  },
  uischema: {}
};

export const UioConfig = types
.model('UioConfig', {
  btn0: types.optional(BtnConfig, {name: 'BTN0'}),
  btn1: types.optional(BtnConfig, {name: 'BTN1'}),
  btn2: types.optional(BtnConfig, {name: 'BTN2'}),
  btn3: types.optional(BtnConfig, {name: 'BTN3'}),
  led0: types.optional(LedConfig, {name: 'LED0'}),
  led1: types.optional(LedConfig, {name: 'LED1'}),
  led2: types.optional(LedConfig, {name: 'LED2'}),
  led3: types.optional(LedConfig, {name: 'LED3'}),
})
.views(self => ({

}))
.actions(self => ({

}));

export interface IUioConfig extends Instance<typeof UioConfig> {}
export interface IUioConfigSnapshot extends SnapshotIn<typeof UioConfig> {}


export const UioState = types
.model('UioState', {
    btn0: types.optional(types.boolean, false),
    btn1: types.optional(types.boolean, false),
    btn2: types.optional(types.boolean, false),
    btn3: types.optional(types.boolean, false),
    led0: types.optional(types.boolean, false),
    led1: types.optional(types.boolean, false),
    led2: types.optional(types.boolean, false),
    led3: types.optional(types.boolean, false),
    led4: types.optional(types.boolean, false),
})
.views(self => ({
    get state(): number[] {
        return [
            self.btn0 ? 1 : 0,
            self.btn1 ? 1 : 0,
            self.btn2 ? 1 : 0,
            self.btn3 ? 1 : 0,
            self.led0 ? 1 : 0,
            self.led1 ? 1 : 0,
            self.led2 ? 1 : 0,
            self.led3 ? 1 : 0,
            self.led4 ? 1 : 0,
        ]
    }
}))
.actions(self => ({
    setState(state: number[]) {
        self.btn0 = state[0] === 1;
        self.btn1 = state[1] === 1;
        self.btn2 = state[2] === 1;
        self.btn3 = state[3] === 1;
        self.led0 = state[4] === 1;
        self.led1 = state[5] === 1;
        self.led2 = state[6] === 1;
        self.led3 = state[7] === 1;
        self.led4 = state[8] === 1;
    },
    setButtonState(idx: number, state: boolean) {
        switch (idx) {
            case 0: self.btn0 = state; break;
            case 1: self.btn1 = state; break;
            case 2: self.btn2 = state; break;
            case 3: self.btn3 = state; break;
        }
    },
    setLedState(idx: number, state: boolean) {
        switch (idx) {
            case 0: self.led0 = state; break;
            case 1: self.led1 = state; break;
            case 2: self.led2 = state; break;
            case 3: self.led3 = state; break;
            case 4: self.led4 = state; break;
        }
    },
    getButtonState(idx: number): boolean {
        switch (idx) {
            case 0: return self.btn0;
            case 1: return self.btn1;
            case 2: return self.btn2;
            case 3: return self.btn3;
        }
        return false;
    },
    getLedState(idx: number): boolean {
        switch (idx) {
            case 0: return self.led0;
            case 1: return self.led1;
            case 2: return self.led2;
            case 3: return self.led3;
            case 4: return self.led4;
        }
        return false;
    }
}));

export interface IUioState extends Instance<typeof UioState> {}
export interface IUioStateSnapshot extends SnapshotIn<typeof UioState> {}
