import { observer } from "mobx-react";
import {
  Divider,
  CardHeader,
  Card,
  CardContent,
  Theme,
} from "@mui/material";
import IoControl from "../IoControl";
import { IIoConfig } from "../../models/uioState";


interface Props {
  index: number;
  config: IIoConfig;
  io: number;
  disabled?: boolean;
  onChange: (state: number) => Promise<void>;
}

const IoCard = ({ index, config, io, disabled, onChange }: Props) => {
  return (
    <Card
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
        title={`I/O ${index + 1}`}
        subheader={config.name}
        titleTypographyProps={{ variant: "h6" }}
        subheaderTypographyProps={{ variant: "subtitle2" }}
        sx={{ p: 1.5 }}
      />

      <Divider />

      <CardContent sx={{ py: 1.5, px: 1.5, m: 0, width: "100%" }}>
        <IoControl
          io={index}
          info={config}
          state={io}
          onChange={onChange}
          disabled={!!disabled}
          hideLabel
        />
      </CardContent>
    </Card>
  )
}

export default observer(IoCard);
