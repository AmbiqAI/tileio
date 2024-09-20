import { observer } from "mobx-react";
import {
  Typography,
  Divider,
  Stack,
  Card,
  CardHeader,
  CardContent,
  useTheme,
  Theme,
} from "@mui/material";
import { ThemeColors } from "../../theme/theme";
import { getQoSName, ISlotConfig } from "../../models/slot";
import QosIcon from "./QosIcon";

interface Props {
  index: number;
  config: ISlotConfig;
  qos: number;
}

const SlotQosCard = ({ index, config, qos }: Props) => {
  const color = ThemeColors.colors.slots[index % ThemeColors.colors.slots.length];
  return (
    <Card
      variant="outlined"
      sx={{
        m: 0,
        borderRadius: 4,
        width: 180,
        bgcolor: (theme: Theme) =>
          theme.palette.mode === "dark"
            ? `rgba(0,0,0,${config.enabled ? 0.8 : 0.3})`
            : `rgba(255,255,255,${config.enabled ? 0.9 : 0.4})`,

      }}
    >
      <CardHeader
        title={`Slot ${index + 1}`}
        subheader={config.name}
        sx={{
          p: 1.5,
          borderBottomStyle: "solid",
          borderBottomWidth: "4px",
          borderBottomColor: color,
          paddingBottom: "8px",
        }}
      />

      <CardContent sx={{ py: 1.5, px: 1.5, m: 0 }}>

        <Stack direction="row" justifyContent="space-between">
          <Typography color="primary" variant="subtitle2" fontWeight={800} pr="8px">
            QoS
          </Typography>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <Typography variant="subtitle2" fontWeight={800} pr="8px">
            {getQoSName(config.enabled, qos)}
          </Typography>
          <QosIcon connected={config.enabled} state={qos} fontSize="medium" />
        </Stack>
        </Stack>

      </CardContent>

      <Divider />
    </Card>
  );
}

export default observer(SlotQosCard);
