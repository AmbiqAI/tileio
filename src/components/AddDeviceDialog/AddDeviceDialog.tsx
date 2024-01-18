import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  Typography,
  useTheme,
  Divider,
  StepLabel,
  Stack,
  Autocomplete,
  TextField,
  CardActions,
  Avatar,
  CardHeader,
  IconButton,
} from "@mui/material";
import validator from '@rjsf/validator-ajv8';
import { DeviceIcon, ScanIcon } from "../../assets/icons";
import UploadIcon from '@mui/icons-material/UploadRounded';

import { useStore } from "../../models/store";
import { ScanButton } from "../ScanButton";
import { Notifier } from "../../api";
import { darkTheme } from "@uiw/react-json-view/dark";
import { lightTheme } from "@uiw/react-json-view/light";
import { Form } from "@rjsf/mui";
import { IDeviceInfo, DeviceInfoSchema } from "../../models/deviceInfo";
import JsonView from "@uiw/react-json-view";
import { VisuallyHiddenInput } from "../VisuallyHiddenInput";
import { NewDevice } from "../../models/device";

interface Props {
  open: boolean;
  close: () => void;
}

const DEVICE_SELECT_STEP = 0;
const DEVICE_CONFIG_STEP = 1;
const DEVICE_REVIEW_STEP = 2;

const AddDeviceDialog = ({ open, close }: Props) => {
  const theme = useTheme();
  const { root } = useStore();
  const performScan = async () => {
    await root.fetchDevices();
  };
  const [inputValue, setInputValue] = useState("");
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [formData, setFormData] = useState<IDeviceInfo|null>();
  const steps = ['Select Device', 'Configure Device', 'Review'];
  const [activeStep, setActiveStep] = useState(0);
  const jsonTheme = theme.palette.mode === 'dark' ? darkTheme : lightTheme;
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={() => { // close();
      }}
    >
      <DialogTitle sx={{ p: 0 }}>

      <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          avatar={
            <Avatar
              variant="rounded"
              aria-label="settings"
              sx={{ bgcolor: "rgba(0,0,0,0)" }}
            >
              <DeviceIcon color="action" fontSize="large" />
            </Avatar>
          }
          action={
            <CardActions>
              {activeStep === DEVICE_CONFIG_STEP && (
                <IconButton
                  component="label"
                  size="small"
                >
                  <UploadIcon />
                  <VisuallyHiddenInput
                    onClick={(e) => {
                      e.currentTarget.value = "";
                    }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                          const text = e.target?.result;
                          if (typeof text === 'string') {
                            const json = JSON.parse(text);
                            setFormData(json);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    type="file"
                    accept="application/json"
                    />
                </IconButton>
              )}
            </CardActions>
          }
          title="Device Settings"
        />

      </DialogTitle>

      <Divider />
      <DialogContent sx={{ bgcolor: "background.paper" }}>

      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Stack
        width="100%"
        height="100%"
        alignItems="just"
        justifyContent="center"
        sx={{ my: 2, mx: 1 }}
        >
      {activeStep === DEVICE_SELECT_STEP && (
        <Stack width="100%" direction="row" alignItems="center" justifyContent="center" my={2} spacing={1}>
        <Autocomplete
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          noOptionsText="No devices found"
          options={root.availableDevices.map(d => d.id)}
          getOptionLabel={(option) => root.availableDeviceById(option)?.info.name || option}
          sx={{ width: "100%" }}
          value={selectedId}
          onChange={(event, newValue) => {
            setSelectedId(newValue);
            setFormData(null);
          }}
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
          disabled={root.fetching}
          size="large"
          sx={{margin: "auto"}}
          variant="outlined"
          onClick={performScan}
          scanning={root.fetching ? "true" : undefined}
        >
          <ScanIcon />
        </ScanButton>
      </Stack>
      )}

      {activeStep === DEVICE_CONFIG_STEP && selectedId && (
      <Form
        schema={DeviceInfoSchema.schema}
        uiSchema={DeviceInfoSchema.uischema}
        formData={formData}
        validator={validator}
        onChange={(e) => setFormData(e.formData)}
        children={true}
      />
      )}

      {(activeStep === 2) && selectedId && (
        <>
          <Typography variant="subtitle1" mb={1}>
            {`Device: ${selectedId.substring(0, 7)}`}
          </Typography>
          <JsonView value={formData || {}} style={jsonTheme}/>
        </>
      )}

      </Stack>

      </DialogContent>

      <DialogActions>
        <Stack width="100%" direction="row" justifyContent="space-between">
        <Button autoFocus onClick={close}>
          Cancel
        </Button>
        <Stack direction="row">
          <Button
            disabled={activeStep === DEVICE_SELECT_STEP}
            onClick={() => {
              setActiveStep((prevActiveStep) => prevActiveStep - 1);
            }}
          >
            Back
          </Button>
          <Button
            disabled={(selectedId === null) || (activeStep === DEVICE_CONFIG_STEP && !formData)}
            onClick={() => {
              if (activeStep === DEVICE_REVIEW_STEP && selectedId && formData) {
                const device = NewDevice(selectedId, formData);
                device.setOnline(true);
                root.addDevice(device);
                Notifier.add({
                  message: `Devices added successfully`,
                  options: { variant: "success" },
                });
                setActiveStep(0);
                setSelectedId(null);
                close();
              } else {
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
              }
            }}
          >
            {activeStep < DEVICE_REVIEW_STEP ? "Next" : "Add"}
          </Button>
        </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default observer(AddDeviceDialog);
