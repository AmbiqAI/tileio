// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

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
  compact?: boolean;
}

const IoSlider = ({ info, state, onChange, disabled, compact }: Props) => {
  const [isDirty, setDirty] = useState(false);
  const [value, setValue] = useState(state);
  const [isSubmitting, setSubmitting] = useState(false);

  useMemo(() => {
    if (!isDirty) {
      setValue(state);
    }
  }, [state, isDirty]);

  return (
    <Stack spacing={compact ? 1 : 2} direction="row" alignItems="center" width="100%" px={compact ? 0.75 : 2} sx={compact ? { height: 36, boxSizing: 'border-box' } : undefined}>
      <Slider
      size={compact ? "small" : "medium"}
      aria-label={info.name}
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
    <Typography variant={compact ? "body2" : "h6"} fontWeight={compact ? 500 : 800} sx={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}> {state} </Typography>
  </Stack>
  )
}

const IoControl = ({ io, info, state, onChange, disabled, hideLabel, compact }: Props) => {
  return (
    <>
      {compact && !hideLabel && (
        <Typography component="div" title={info.name} noWrap sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'text.primary', width: '100%', mb: 0.5 }}>
          {info.name}
        </Typography>
      )}
      {info.ioType === UIOType.Momentary && (
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Button
            variant="contained"
            size={compact ? "small" : "medium"}
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
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Typography variant="subtitle2" fontWeight={800} >
            {info.off}
          </Typography>
          <Switch
            inputProps={{ 'aria-label': info.name }}
            checked={!!state}
            onChange={async (_, checked) => {
              await onChange(checked ? 1 : 0);
            }}
            disabled={!info.enabled || disabled}
            size={compact ? "small" : "medium"}
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
          compact={compact}
        />
      )}
      {info.ioType === UIOType.Select && (
        <Stack direction="row" alignItems="center" justifyContent="center" sx={compact ? { width: '100%' } : undefined}>
          <FormControl sx={compact ? { m: 0, width: '100%', minWidth: 0 } : { m: 1, minWidth: 110 }} size="small">
            <Select
              inputProps={{ 'aria-label': info.name }}
              sx={compact ? { height: 36, fontSize: 13, '& .MuiSelect-select': { py: 0.75, pl: 1 } } : undefined}
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
      {!compact && !hideLabel && (
        <Typography variant="button">
          {info.name}
        </Typography>
      )}
    </>
  );
};

export default observer(IoControl);
