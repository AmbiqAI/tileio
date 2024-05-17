import { observer } from "mobx-react";
import {
  Typography,
  Stack,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
  Button,
} from "@mui/material";
import { IIoConfig, UIOType } from "../models/uioState";
import { useMemo, useState } from "react";

interface Props {
  io: number;
  info: IIoConfig;
  state: number;
  onChange: (state: number) => Promise<void>;
  disabled: boolean;
  hideLabel?: boolean;
}

const IoSlider = ({ io, info, state, onChange, disabled, hideLabel }: Props) => {
  const [isDirty, setDirty] = useState(false);
  const [value, setValue] = useState(state);
  const [isSubmitting, setSubmitting] = useState(false);

  useMemo(() => {
    if (!isDirty) {
      setValue(state);
    }
  }, [state, isDirty]);

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
    <Typography variant="h6" fontWeight={800}> {state} </Typography>
  </Stack>
  )
}

const IoControl = ({ io, info, state, onChange, disabled, hideLabel }: Props) => {
  return (
    <>
      {info.ioType === UIOType.Momentary && (
        <Stack direction="row" alignItems="center">
          {/* <Typography variant="subtitle2" fontWeight={800} >
            TEST
          </Typography> */}
          <Button
            variant="contained"
            color="primary"
            disabled={!info.enabled || disabled}
            onClick={async () => {
              await onChange(1);
            }}
          >
            {info.on}
          </Button>
        </Stack>
      )}
      {info.ioType === UIOType.Toggle && (
        <Stack direction="row" alignItems="center">
          <Typography variant="subtitle2" fontWeight={800} >
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
          <Typography variant="subtitle2" fontWeight={800} >
            {info.on}
          </Typography>
        </Stack>
      )}
      {info.ioType === UIOType.Slider && (
        <IoSlider
          io={io}
          info={info}
          state={state}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      {info.ioType === UIOType.Select && (
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
      {!hideLabel && (
        <Typography variant="button">
          {info.name}
        </Typography>
      )}
    </>
  );
};

export default observer(IoControl);
