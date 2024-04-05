import { observer } from "mobx-react";
import {
  Typography,
  Stack,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { IIoConfig } from "../models/uioState";
import { useState } from "react";

interface Props {
  io: number;
  info: IIoConfig;
  state: number;
  onChange: (state: number) => Promise<void>;
  disabled: boolean;

}

const IoSlider = ({ io, info, state, onChange, disabled }: Props) => {
  const [isDirty, setDirty] = useState(false);
  const [value, setValue] = useState(state);
  const [isSubmitting, setSubmitting] = useState(false);

  return (
    <Stack spacing={2} direction="row" alignItems="center" width="100%" px={2}>
      <Slider
      value={value}
      onChange={(_, value) => {
        if (!isDirty) {
          setDirty(true);
        }
        setValue(value as number);
      }}
      onChangeCommitted={async (_, value) => {
        setSubmitting(true);
        await onChange(value as number);
        setSubmitting(false);
        setDirty(false);
      }}

      disabled={!info.enabled || disabled || isSubmitting}
      min={info.min}
      max={info.max}
      step={info.step}
    />
    <Typography variant="h6"> {state} </Typography>
  </Stack>
  )
}

const IoControl = ({ io, info, state, onChange, disabled }: Props) => {
  return (
    <>
      {info.ioType === "Toggle" && (
        <Stack direction="row" alignItems="center">
          <Typography variant="button" fontWeight={800} >
            {info.off}
          </Typography>
          <Switch
            checked={!!state}
            onChange={async (_, checked) => {
              await onChange(checked ? 1 : 0);
            }}
            disabled={!info.enabled || disabled}
            size="medium"
          />
          <Typography variant="button" fontWeight={800} >
            {info.on}
          </Typography>
        </Stack>
      )}
      {info.ioType === "Slider" && (
        <IoSlider
          io={io}
          info={info}
          state={state}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      {info.ioType === "Select" && (
        <Stack direction="row" alignItems="center">
          <FormControl sx={{ m: 1, minWidth: 110 }} size="small">
            <Select
              value={state}
              onChange={async (e) => {
                await onChange(e.target.value as number);
              }}
              disabled={disabled || !info.enabled || info.direction === "Output"}
            >
              {info.selectInputs.map((item, idx) => (
                <MenuItem key={idx} value={idx}> {item} </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}
      <Typography variant="h6">
        {info.name}
      </Typography>
    </>
  );
};

export default observer(IoControl);
