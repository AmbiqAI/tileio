import { useState } from "react";
import { observer } from "mobx-react";
import {
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Divider,
  DialogContentText,
} from "@mui/material";
import { Form } from "@rjsf/mui";
import validator from '@rjsf/validator-ajv8';
import { ITile } from "../../models/tile";
import { TileSpec } from "../Tiles/BaseTile";

interface Props {
  open: boolean;
  tile: ITile;
  spec: TileSpec;
  config: { [key: string]: any };
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

const TileSettingDialog = ({ open, onSubmit, onClose, tile, spec, config }: Props) => {
  const [formData, setFormData] = useState(config);
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={() => {
        onClose();
      }}
    >
      <DialogTitle>
        {tile.name}
      </DialogTitle>

      <Divider />

      <DialogContent>
        <DialogContentText>
          {spec.description}
        </DialogContentText>
        <Form
          schema={spec.schema}
          uiSchema={spec.uischema}
          formData={formData}
          validator={validator}
          liveValidate
          onChange={(e) => setFormData(e.formData)}
          children={true}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" autoFocus onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          autoFocus
          onClick={() => {
            onSubmit(formData);
          }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(TileSettingDialog);
