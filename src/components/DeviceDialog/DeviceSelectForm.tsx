import { useMemo, useState } from "react";
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
  InputLabel,
} from "@mui/material";
import { ScanIcon } from "../../assets/icons";

import { useStore } from "../../models/store";
import { ScanButton } from "../ScanButton";
import DeviceStateIcon from "../DeviceStateIcon";
import { DeviceInterfaceType } from "../../models/types";
import { IDeviceInfoSnapshot } from "../../models/deviceInfo";

interface Props {
  size?: "small" | "medium";
}

const DeviceSelectForm = ({ size }: Props) => {
  const isSmall = size === "small";
  const { root: { backend, device, setActiveDevice } } = useStore();

  const performScan = async () => {
    await backend.fetchDevices();
  };
  // const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<IDeviceInfoSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<IDeviceInfoSnapshot | null>(null);

  useMemo(() => {
    setOptions(backend.availableDevices);
  }, [backend.availableDevices]);

  return (
    <Box sx={{ p: 2, width: "100%" }}>
      <Stack
        height="100%"
        width="100%"
        direction={isSmall ? "column" : "row"}
        alignItems="stretch"
        justifyContent="center"
        mx={2}
        my={2}
        spacing={1}
        padding={1}
      >
        <FormControl sx={{ m: 1, minWidth: "80px" }} >
          <Select
            autoWidth
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
        {/* Replace autocomplete with simple <Select /> */}

        <FormControl sx={{ m: 1, minWidth: 300 }} >
        <InputLabel id="device-select-label">Select Device</InputLabel>
        <Select
          label="Select Device"
          value={selectedId?.id}
          onChange={(e) => {
            const id = e.target.value as string;
            setSelectedId(options.find((d) => d.id === id) || null);
          }}
        >
          {options.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              <Stack width="100%" direction="row" alignItems="center" justifyContent="space-between">
                <Typography>{`${d.name} (${d.id.substring(0, 7)})`}</Typography>
                <DeviceStateIcon connected={true} online={true} type={d.type!} />
              </Stack>
            </MenuItem>
          ))}
        </Select>
        </FormControl>
        {/* <Autocomplete
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          noOptionsText="No devices found"
          options={options}
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
              <DeviceStateIcon connected={true} online={true} type={option.type!} />
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
        /> */}
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

DeviceSelectForm.defaultProps = {
  size: "medium",
};

export default observer(DeviceSelectForm);
