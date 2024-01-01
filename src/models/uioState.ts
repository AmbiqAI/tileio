import { types } from 'mobx-state-tree';


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
