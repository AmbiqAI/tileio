import { observer } from "mobx-react";
import {
  Stack,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { ISlotConfig } from "../../models/slot";
import SlotConfigCard from "../SlotConfigCard";

interface Props {
  slots: ISlotConfig[];
}

const SlotOverviewTab = ({ slots }: Props) => {
  return (
    <Stack spacing={1} direction="column" justifyContent="center" height="100%" width="100%" p={2}>
      <Stack direction="row" justifyContent="flex-start" width="100%">
        <Typography variant="h6" ml={1}>Slot Setup</Typography>
      </Stack>
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {slots.map((slot, index) => (
          <Box key={`slot-${index}`} sx={{ margin: 1 }}>
            <SlotConfigCard slot={slot} index={index} />
          </Box>
        ))}
      </Box>
    </Stack>
  )
}


export default observer(SlotOverviewTab);
