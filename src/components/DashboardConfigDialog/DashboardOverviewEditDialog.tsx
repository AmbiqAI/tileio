import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Divider,
  FormGroup,
  Typography,
  TextField,
  Slider,
  Box,
} from "@mui/material";
import { useState } from "react";


interface Props {
  info: {name: string, description: string, duration: number };
  onCancel: () => void;
  onSubmit: (info: {name: string, description: string, duration: number }) => void;
  open: boolean;
}

const durationOptions = [
  { label: "5 sec", value: 5 },
  ...Array(11).fill(0).map((v, i) => ({ label: "", value: 5 * (i + 1) })),
  { label: "60 sec", value: 60 },
];

const DashboardOverviewEditDialog = ({ open, info, onCancel, onSubmit }: Props) => {

  const [newInfo, setNewInfo] = useState(info);
  const handleCancel = () => {
    setNewInfo(info);
    onCancel();
  }
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={handleCancel}
    >
      <DialogTitle>
        Edit Dashboard Overview
      </DialogTitle>

      <Divider />

      <DialogContent autoFocus>

      <form>
        <FormGroup>
          <Typography variant="h6" color="text.primary" fontWeight={400} my={1}>
            Name
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={newInfo.name}
            onChange={(event) => {
              setNewInfo({ ...newInfo, name: event.target.value });
            }}
          />
        </FormGroup>

        <Divider />

        <FormGroup>
          <Typography variant="h6" color="text.primary" fontWeight={400} my={1}>
            Description
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            multiline
            placeholder="Add markdown description here..."
            value={newInfo.description}
            onChange={(event) => {
              setNewInfo({ ...newInfo, description: event.target.value });
            }}
          />
        </FormGroup>

        <FormGroup>
          <Typography variant="h6" color="text.primary" fontWeight={400} my={1}>
            Time Window
          </Typography>
          <Box sx={{ mx: 2 }}>
            <Slider
              size="medium"
              color="secondary"
              valueLabelDisplay="auto"
              value={newInfo.duration}
              step={5}
              min={5}
              max={60}
              marks={durationOptions}
              onChange={(event, newValue, activeThumb) => {
                if (typeof newValue === "number") {
                  setNewInfo({ ...newInfo, duration: newValue });
                }
              }}
            />
          </Box>
        </FormGroup>

        </form>
      </DialogContent>

      <DialogActions>

        <Button
          variant="outlined"
          onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onSubmit(newInfo);
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(DashboardOverviewEditDialog);
