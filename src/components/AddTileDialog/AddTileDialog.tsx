import { useState } from "react";
import { observer } from "mobx-react-lite";
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';
import {
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  TextField,
  Stack,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material";
import { Form } from "@rjsf/mui";
import validator from '@rjsf/validator-ajv8';
import { RegisteredTiles, TileSpec } from "../Tiles/BaseTile";
import { ITileSnapshot } from "../../models/dashboardSettings";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (tile: ITileSnapshot) => Promise<void>;
}

const TILE_SELECT_STEP = 0;
const TILE_CONFIG_STEP = 1;
const TILE_REVIEW_STEP = 2;

const AddTileDialog = ({ open, onSubmit, onClose }: Props) => {
  const theme = useTheme();
  const tileOptions = Object.keys(RegisteredTiles);
  const [inputValue, setInputValue] = useState("");
  const [selectedTileName, setSelectedTileName] = useState<string|null>(null);
  const [selectedTile, setSelectedTile] = useState<TileSpec|null>();
  const [formData, setFormData] = useState({});
  const steps = ['Select Tile', 'Configure Tile', 'Review'];
  const [activeStep, setActiveStep] = useState(0);
  const jsonTheme = theme.palette.mode === 'dark' ? darkTheme : lightTheme;
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
        Add Tile
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
      {activeStep === TILE_SELECT_STEP && (
        <Autocomplete
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={tileOptions}
          getOptionLabel={(option) => RegisteredTiles[option].spec.name}
          sx={{ minWidth: 240 }}
          value={selectedTileName}
          onChange={(event, newValue) => {
            setSelectedTileName(newValue);
            if (newValue === null || !(newValue in RegisteredTiles)) {
              setSelectedTile(null);
              setFormData({});
            } else {
              setSelectedTile(RegisteredTiles[newValue].spec);
              setFormData({});
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="normal"
              label="Select"
              variant="outlined"
            />
          )}
        />
      )}

      {activeStep === TILE_CONFIG_STEP && selectedTile && (
            <Form
            schema={selectedTile.schema}
            uiSchema={selectedTile.uischema}
            formData={formData}
            validator={validator}
            onChange={(e) => setFormData(e.formData)}
            children={true}
          />
      )}

      {activeStep === TILE_REVIEW_STEP && selectedTile && (
        <>
          <Typography variant="subtitle1" mb={1}>
            {`TILE: ${selectedTile.name}`}
          </Typography>
          <JsonView value={formData} style={jsonTheme}/>
        </>
      )}

      </Stack>

      </DialogContent>

      <DialogActions>
        <Stack width="100%" direction="row" justifyContent="space-between">
        <Button
          autoFocus
          onClick={() => {
            setActiveStep(0);
            setSelectedTileName(null);
            setSelectedTile(null);
            setFormData({});
            onClose();
          }}>
          Cancel
        </Button>
        <Stack direction="row">
          <Button
            disabled={activeStep === TILE_SELECT_STEP}
            onClick={() => {
              setActiveStep((prevActiveStep) => prevActiveStep - 1);
            }}
          >
            Back
          </Button>
          <Button
            disabled={(selectedTile === null) || (activeStep === TILE_REVIEW_STEP && !formData)}
            onClick={() => {
              if (activeStep === 2 && selectedTile) {
                const tile = {
                  name: selectedTile.name,
                  type: selectedTile.type,
                  size: selectedTile.sizes[0],
                  config: formData,
                } as ITileSnapshot;
                setActiveStep(0);
                setSelectedTileName(null);
                setSelectedTile(null);
                setFormData({});
                onSubmit(tile);
              } else {
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
              }
            }}
          >
            {activeStep < 2 ? "Next" : "Add"}
          </Button>
        </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default observer(AddTileDialog);
