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
import { ISlotConfigSnapshot, SlotConfigSchema } from "../../models/slot";

interface Props {
  open: boolean;
  index: number;
  slot: ISlotConfigSnapshot;
  onClose: () => void;
  onSubmit: (formData: ISlotConfigSnapshot) => Promise<void>;
}

const SlotConfigEditDialog = ({ open, onSubmit, onClose, index, slot }: Props) => {
  const formRef = useRef<any>();
  const [formData, setFormData] = useState<ISlotConfigSnapshot>(slot);
  const onCancel = () => {
    setFormData(slot);
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
        {`Slot ${index + 1}`}
      </DialogTitle>

      <Divider />

      <DialogContent autoFocus>
        <Form
          ref={formRef}
          schema={SlotConfigSchema.schema}
          uiSchema={SlotConfigSchema.uischema}
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
            console.log('iddqd', formRef.current.state.errors);
            console.debug(formData);
            onSubmit(formData);
          }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(SlotConfigEditDialog);
