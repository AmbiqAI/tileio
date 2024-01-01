import { useState } from "react";
import {
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Button,
  TextField,
} from "@mui/material";

interface Props {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  count: number;
  onConfirm: () => Promise<void>;
}

const ConfirmCountDialog = ({
  title,
  open,
  setOpen,
  count,
  onConfirm,
}: Props) => {
  const [inputCount, setInputCount] = useState<number | undefined>(undefined);
  return (
    <Dialog
      open={open}
      maxWidth="lg"
      onClose={() => {
        setInputCount(undefined);
        setOpen(false);
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography> Please enter {count} to confirm action. </Typography>
        <TextField
          id="confirm-count"
          label="confirm number"
          margin="normal"
          size="small"
          variant="standard"
          placeholder=""
          inputProps={{ spellCheck: false }}
          fullWidth
          autoComplete="off"
          type="number"
          value={inputCount}
          onChange={(event) => {
            if (event.target.value.length) {
              setInputCount(parseInt(event.target.value));
            } else {
              setInputCount(undefined);
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={async () => {
            setInputCount(undefined);
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          color="error"
          disabled={!open || count !== inputCount}
          variant="outlined"
          onClick={async () => {
            setOpen(false);
            setInputCount(undefined);
            await onConfirm();
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmCountDialog;
