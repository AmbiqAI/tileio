import { useRef, useState } from "react";
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
import { IDashboard } from "../../models/dashboard";

interface Props {
  dashboard: IDashboard;
  onClose: () => void;
  open: boolean;
}

const durationOptions = [
  { label: "5 sec", value: 5 },
  ...Array(11).fill(0).map((v, i) => ({ label: "", value: 5 * (i + 1) })),
  { label: "60 sec", value: 60 },
];

const DashboardOverviewEditDialog = ({ open, dashboard, onClose }: Props) => {
  const formRef = useRef<any>();
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
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
            value={dashboard.name}
            onChange={(event) => {
              dashboard.setName(event.target.value);
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
            value={dashboard.description}
            onChange={(event) => {
              dashboard.setDescription(event.target.value);
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
              value={dashboard.duration}
              step={5}
              min={5}
              max={60}
              marks={durationOptions}
              onChange={(event, newValue, activeThumb) => {
                if (typeof newValue === "number") {
                  dashboard.setDuration(newValue);
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
          disabled={formRef.current?.state.errors.length > 0}
          onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(DashboardOverviewEditDialog);
