import { observer } from "mobx-react";
import EditIcon from "@mui/icons-material/Edit";
import {
  CardHeader,
  Typography,
  Divider,
  Card,
  CardContent,
  useTheme,
  Theme,
  IconButton,
} from "@mui/material";
import { IIoConfig, IIoConfigSnapshot, UIOType } from "../../models/uioState";
import { getSnapshot } from "mobx-state-tree";
import { useState } from "react";
import IoConfigEditDialog from "./IoConfigEditDialog";

interface Props {
  io: IIoConfig;
  index: number;
  disabled?: boolean;
}

const IoConfigCard = ({ io, index, disabled }: Props) => {
  const [showEditIoConfigDialog, setShowEditIoConfigDialog] = useState(false);
  const [draftIo, setDraftIo] = useState<IIoConfigSnapshot>(getSnapshot(io));

  const theme = useTheme();
  return (
    <>
      <Card
        variant="outlined"
        sx={{
          m: 0,
          borderRadius: 4,
          width: 225,
          bgcolor: (theme: Theme) =>
            theme.palette.mode === "dark"
              ? `rgba(0,0,0,${io.enabled ? 0.8 : 0.3})`
              : `rgba(255,255,255,${io.enabled ? 0.9 : 0.4})`,
        }}
      >
        <CardHeader
          title={`I/O ${index + 1}`}
          subheader={io.name}
          sx={{ p: 1.5 }}
          action={
            <IconButton
              size="small"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setDraftIo(getSnapshot(io));
                setShowEditIoConfigDialog(true);
              }}
            >
              <EditIcon />
            </IconButton>
          }
        />

        <Divider />

        <CardContent sx={{ py: 1.5, px: 1.5, m: 0, height: "125px", overflow: "scroll" }}>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Status: &nbsp;</span>
            <span style={{ color: io.enabled ? theme.palette.text.primary : theme.palette.error.main }}>{io.enabled ? "Enabled" : "Disabled"} </span>
          </Typography>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Direction: &nbsp;</span> {io.direction}
          </Typography>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Type: &nbsp;</span> {io.ioType}
          </Typography>

          {io.ioType === UIOType.Momentary && (
            <Typography variant="subtitle2">
              <span style={{ color: theme.palette.primary.main }}>On: &nbsp;</span> {io.on}
            </Typography>
          )}

          {io.ioType === UIOType.Toggle && (
            <>
              <Typography variant="subtitle2">
                <span style={{ color: theme.palette.primary.main }}>On: &nbsp;</span> {io.on}
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ color: theme.palette.primary.main }}>Off: &nbsp;</span> {io.off}
              </Typography>
            </>
          )}

          {io.ioType === UIOType.Slider && (
            <>
              <Typography variant="subtitle2">
                <span style={{ color: theme.palette.primary.main }}>Range: &nbsp;</span> {`${io.min} - ${io.max}`}
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ color: theme.palette.primary.main }}>Step: &nbsp;</span> {io.step}
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ color: theme.palette.primary.main }}>Default: &nbsp;</span> {io.defaultValue}
              </Typography>
            </>
          )}

          {io.ioType === UIOType.Select && (
            <>
              <Typography variant="subtitle2">
                <span style={{ color: theme.palette.primary.main }}>Options: &nbsp;</span> {io.selectInputs.length}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
      <IoConfigEditDialog
        open={showEditIoConfigDialog}
        io={draftIo}
        index={index}
        onSubmit={async (formData: IIoConfigSnapshot) => {
          setShowEditIoConfigDialog(false);
          io.copyFrom(formData);
        }}
        onClose={() => {
          setShowEditIoConfigDialog(false);
          setDraftIo(getSnapshot(io));
        }}
      />
    </>
  )
}

export default observer(IoConfigCard);
