import { Card } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { observer } from "mobx-react-lite";
import { IRecord } from "../../../models/record";
import { CreateTile } from "../../../components/Tiles";
import { TileSize } from "../../../components/Tiles/BaseTile";

type Params = {
  name: string;
  type: string;
  size: TileSize;
  record: IRecord;
  config: { [key: string]: any};
};

const TileCard = ({ name, type, size, record, config }: Params) => {
  const mw = size === "sm" ? 256 : size === "md" ? 512 : 1024;
  const mh = size === "sm" ? 190 : size === "md" ? 190 : 190;  // 312;
  const xs = size === "sm" ? 6 : size === "md" ? 12 : 12;
  const sm = size === "sm" ? 3 : size === "md" ? 6 : 12;
  const md = size === "sm" ? 2 : size === "md" ? 4 : 6;
  const lg = size === "sm" ? 2 : size === "md" ? 4 : 6;
  const xl = size === "sm" ? 3 : size === "md" ? 6 : 12;

  return (
    <Grid
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      sx={{ maxWidth: mw, minWidth: 124 }}
      flexGrow={0}
    >
      <Card
        elevation={1}
        sx={{
          m: 0,
          p: 0,
          borderRadius: 2,
          height: mh,
          maxWidth: mw,
          minWidth: 144,
        }}
      >
        {CreateTile({
          name: name,
          type: type,
          size: size,
          slots: record.slots,
          pause: false,
          duration: record.settings.duration,
          record: record,
          config: config,
          device: record.device
        })}
      </Card>
    </Grid>
  );
};

export default observer(TileCard);
