import React from "react";
import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  Typography,
  Divider,
  Stack,
  FormGroup,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { IDevice } from "../../models/device";
import { IIoConfig } from "../../models/uioState";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import IoControl from "../IoControl";
import { delay } from "../../utils";

interface Props {
  open: boolean;
  onClose: () => void;
  device: IDevice;
}

interface IoControlProps {
  io: number;
  info: IIoConfig;
  state: number;
  onChange: (state: number) => void;
  disabled: boolean;

}

// const IoControl = observer(({ io, info, state, onChange, disabled }: IoControlProps) => {
//   return (
//     <>
//       {info.ioType === "Toggle" && (
//         <Stack direction="row" alignItems="center">
//           <Typography variant="button" fontWeight={800} >
//             {info.off}
//           </Typography>
//           <Switch
//             checked={!!state}
//             onChange={(_, checked) => {
//               onChange(checked ? 1 : 0);
//             }}
//             disabled={!info.enabled || disabled}
//             size="medium"
//           />
//           <Typography variant="button" fontWeight={800} >
//             {info.on}
//           </Typography>
//         </Stack>
//       )}
//       {info.ioType === "Slider" && (
//         <Stack spacing={2} direction="row" alignItems="center" width="100%">
//           <Slider
//             value={state}
//             onChange={(_, value) => {
//               console.log("Setting I/O", io, "to", value);
//               onChange(value as number);
//             }}
//             disabled={!info.enabled || disabled}
//             min={info.min}
//             max={info.max}
//             step={info.step}
//           />
//           <Typography variant="h6"> {state} </Typography>
//         </Stack>
//       )}
//       {info.ioType === "Select" && (
//         <Stack direction="row" alignItems="center">
//           <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
//             <Select
//               value={state}
//               onChange={(e) => {
//                 onChange(e.target.value as number);
//               }}
//               disabled={disabled || !info.enabled || info.direction === "Output"}
//             >
//               {info.selectInputs.map((item, idx) => (
//                 <MenuItem key={idx} value={idx}> {item} </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Stack>
//       )}
//       <Typography variant="h6">
//         {info.name}
//       </Typography>
//     </>
//   );
// });


const UioDialog = ({ open, onClose, device }: Props) => {

  const ioItems = [{
    info: device.info.uio.io0,
    state: device.uioState.io0,
  }, {
    info: device.info.uio.io1,
    state: device.uioState.io1,
  }, {
    info: device.info.uio.io2,
    state: device.uioState.io2,
  }, {
    info: device.info.uio.io3,
    state: device.uioState.io3,
  }, {
    info: device.info.uio.io4,
    state: device.uioState.io4,
  }, {
    info: device.info.uio.io5,
    state: device.uioState.io5,
  }, {
    info: device.info.uio.io6,
    state: device.uioState.io6,
  }, {
    info: device.info.uio.io7,
    state: device.uioState.io7,
  }];

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      onClose={onClose}
    >
      <DialogTitle>
        User I/O
      </DialogTitle>
      <Divider />
      <DialogContent>

        <FormGroup>
          <Grid container spacing={5} width="100%" height="100%" pb={4}>
            {ioItems.map((io, idx) => (
              io.info.enabled && (
              <Grid xs={6} key={`io-${io.info.name}-${idx}`}>
                <Stack direction="column" alignItems="center">
                    <IoControl
                      io={idx}
                      info={io.info}
                      state={io.state}
                      onChange={async (state: number) => {
                        await device.uioState.updateIoState(idx, state);
                      }}
                      disabled={!device.state.connected} />
                    </Stack>
                    </Grid>
                  )
            ))}
          </Grid>
        </FormGroup>

      </DialogContent>
    </Dialog>
  );
};


export default observer(UioDialog);
