import { Card } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { observer } from "mobx-react";
import { CreateTile } from "../../../components/Tiles";
import { TileSize } from "../../../components/Tiles/BaseTile";
import { IDashboard } from "../../../models/dashboard";
import { ISlot } from "../../../models/slot";
import { IUioState } from "../../../models/uioState";

type Params = {
  name: string;
  type: string;
  size: TileSize;
  pause: boolean;
  slots: ISlot[];
  uioState?: IUioState;
  dashboard: IDashboard;
  config: { [key: string]: any};
};

const TileCard = ({ name, type, size, slots, dashboard, pause, uioState, config }: Params) => {
  // const mw = size === "sm" ? 256 : size === "md" ? 512 : 1024;
  const mh = size === "sm" ? 200 : size === "md" ? 200 : 200;  // 312;
  const xs = size === "sm" ? 6 : size === "md" ? 12 : 12;
  const sm = size === "sm" ? 3 : size === "md" ? 6 : 12;
  const md = size === "sm" ? 2 : size === "md" ? 4 : 6;
  const lg = size === "sm" ? 2 : size === "md" ? 4 : 6;
  const xl = size === "sm" ? 2 : size === "md" ? 4 : 6;

  return (
    <Grid
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      // sx={{ maxWidth: mw, minWidth: 124 }}
      flexGrow={0}
    >
      <Card
        elevation={1}
        sx={{
          m: 0,
          p: 0,
          // background: 'red',
          borderRadius: 4,
          width: "100%",
          // height: "100%"
          height: mh,
          // maxWidth: mw,
          // minWidth: 144,
        }}
      >

        {CreateTile({
          name: name,
          type: type,
          size: size,
          slots: slots,
          pause: pause,
          dashboard: dashboard,
          duration: dashboard.duration,
          // record: device.record,
          config: config,
          uioState: uioState
        })}
      </Card>
    </Grid>
  );
};

export default observer(TileCard);
