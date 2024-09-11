import { useRef, useState } from "react";
import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Divider,
} from "@mui/material";
import { Form } from "@rjsf/mui";
import validator from '@rjsf/validator-ajv8';
import { IIoConfigSnapshot, IoConfigSchema } from "../../models/uioState";

interface Props {
  open: boolean;
  index: number;
  io: IIoConfigSnapshot;
  onClose: () => void;
  onSubmit: (formData: IIoConfigSnapshot) => Promise<void>;
}

const IoConfigEditDialog = ({ open, onSubmit, onClose, index, io }: Props) => {
  const formRef = useRef<any>();
  const [formData, setFormData] = useState<IIoConfigSnapshot>(io);
  const onCancel = () => {
    setFormData(io);
    onClose();
  };
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onCancel}
    >
      <DialogTitle>
        {`I/O ${index + 1}`}
      </DialogTitle>

      <Divider />

      <DialogContent autoFocus>
        <Form
          ref={formRef}
          schema={IoConfigSchema.schema}
          uiSchema={IoConfigSchema.uischema}
          formData={formData}
          validator={validator}
          liveValidate
          onChange={(e) => setFormData(e.formData)}
          children={true}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="outlined"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          disabled={formRef.current?.state.errors.length > 0}
          onClick={() => {
            onSubmit(formData);
          }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(IoConfigEditDialog);
