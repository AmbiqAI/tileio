import { useState } from "react";
import { observer } from "mobx-react";
import {
  Button,
  Typography,
  Autocomplete,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Box,
  Divider,
} from "@mui/material";
import { ScanIcon } from "../../assets/icons";

import { useStore } from "../../models/store";
import { ScanButton } from "../ScanButton";
import DeviceStateIcon from "../DeviceStateIcon";
import { DeviceInterfaceType } from "../../models/types";

interface Props {
}

const DeviceSelectForm = ({ }: Props) => {
  const { root: { backend, device, setActiveDevice } } = useStore();

  const performScan = async () => {
    await backend.fetchDevices();
  };
  const [inputValue, setInputValue] = useState("");
  const [selectedId, setSelectedId] = useState<{ id: string, name: string, type: DeviceInterfaceType } | null>(null);

  return (
    <Box sx={{ p: 2 }}>
      <Stack width="100%" direction="row" alignItems="center" justifyContent="center" my={2} spacing={1}>
        <FormControl sx={{ m: 1, minWidth: 110 }} size="small">
          <Select
            disabled={backend.fetching}
            value={backend.interface}
            onChange={async (e) => {
              setSelectedId(null);
              backend.setInterface(e.target.value as DeviceInterfaceType);
            }}
          >
            {backend.availableInterfaces.map((b) => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          noOptionsText="No devices found"
          options={backend.availableDevices.map(d => ({ id: d.id, name: d.name, type: d.type }))}
          autoHighlight
          getOptionLabel={(option) => `${option.name} (${option.id.substring(0, 7)})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          sx={{ width: "100%" }}
          value={selectedId}
          onChange={(_, newValue) => {
            setSelectedId(newValue);
          }}
          renderOption={(props, option) => (
            <Stack {...props} component="li" direction="row" alignItems="center" justifyContent="space-between" mx={1}>
              <Typography width="100%" >
                {`${option.name} (${option.id.substring(0, 7)})`}
              </Typography>
              <DeviceStateIcon connected={true} online={true} type={option.type} />
            </Stack>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Select"
              variant="outlined"
            />
          )}
        />
        <ScanButton
          disableRipple
          disabled={backend.fetching || !!device}
          size="large"
          sx={{ margin: "auto" }}
          variant="outlined"
          onClick={performScan}
          scanning={backend.fetching ? "true" : undefined}
        >
          <ScanIcon />
        </ScanButton>
      </Stack>

      <Typography variant="body2" color="textSecondary" align="center">
        Select interface and scan for available devices. Once discovered select the target device from the list.
        If the device is not listed, ensure it is powered on and in range.
      </Typography>

      <Divider sx={{ py: 1 }} />

      <Stack width="100%" direction="row" justifyContent="end" mt={2}>
        <Stack direction="row">
          <Button
            autoFocus
            variant="outlined"
            disabled={(selectedId === null)}
            onClick={() => {
              if (selectedId) {
                setActiveDevice(selectedId.id);
                setSelectedId(null);
              }
            }}
          >
            Select
          </Button>
        </Stack>
      </Stack>
    </Box>

  );
};

export default observer(DeviceSelectForm);
