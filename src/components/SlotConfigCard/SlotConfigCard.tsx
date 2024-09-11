import { observer } from "mobx-react";
import EditIcon from "@mui/icons-material/Edit";
import {
  CardHeader,
  Typography,
  Divider,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Theme,
} from "@mui/material";
import { ISlotConfig, ISlotConfigSnapshot } from "../../models/slot";
import { useState } from "react";
import SlotConfigEditDialog from "./SlotConfigEditDialog";
import { getSnapshot } from "mobx-state-tree";

interface Props {
  slot: ISlotConfig;
  index: number;
  disabled?: boolean;
}

const SlotConfigCard = ({ slot, index, disabled }: Props) => {
  const [showEditSlotConfigDialog, setShowEditSlotConfigDialog] = useState(false);
  const [draftSlot, setDraftSlot] = useState<ISlotConfigSnapshot>(getSnapshot(slot));
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
              ? `rgba(0,0,0,${slot.enabled ? 0.8 : 0.3})`
              : `rgba(255,255,255,${slot.enabled ? 0.9 : 0.4})`,
        }}
      >
        <CardHeader
          title={`Slot ${index + 1}`}
          subheader={slot.enabled ? slot.name: "Disabled"}
          sx={{ px: 1.5, py: 1.0 }}
          titleTypographyProps={{
            color: slot.enabled ? "textPrimary" : "error",
          }}
          subheaderTypographyProps={{
            color: slot.enabled ? "textPrimary" : "error",
          }}
          action={
            <IconButton
              size="small"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setDraftSlot(getSnapshot(slot));
                setShowEditSlotConfigDialog(true);
              }}
            >
              <EditIcon />
            </IconButton>
          }
        />

        <Divider />

        <CardContent sx={{ py: 1.0, px: 1.5, m: 0, height: "150px", overflow: "scroll" }}>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Signal Type: &nbsp;</span> {slot.type}
          </Typography>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Signal Units: &nbsp;</span> {slot.unit}
          </Typography>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Sampling Rate: &nbsp;</span> {slot.fs} Hz
          </Typography>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Data Type: &nbsp;</span> {slot.dtypeFullName}
          </Typography>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Channels: &nbsp;</span> {slot.chs.length}
          </Typography>

          <Typography variant="subtitle2">
            <span style={{ color: theme.palette.primary.main }}>Metrics: &nbsp;</span> {slot.metrics.length}
          </Typography>

          {/* <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, width: "100%" }}>
                  {slot.chs.map((ch, index) => (
                    <Chip
                      size="medium"
                      variant="outlined"
                      key={`slot-${index}-ch-${index}`}
                      avatar={<Avatar>{`CH${index + 1}`}</Avatar>}
                      label={ch.substring(0, 7)} />
                  ))}
                </Box> */}

        </CardContent>
      </Card>
      <SlotConfigEditDialog
        open={showEditSlotConfigDialog}
        slot={draftSlot}
        index={index}
        onSubmit={async (formData: ISlotConfigSnapshot) => {
          setShowEditSlotConfigDialog(false);
          slot.copyFrom(formData);
        }}
        onClose={() => {
          setShowEditSlotConfigDialog(false);
          setDraftSlot(getSnapshot(slot));
        }}
      />
    </>
  );
}

export default observer(SlotConfigCard);
