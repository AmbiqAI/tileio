// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

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
  const mh = size === "sm" ? 190 : size === "md" ? 190 : 190;
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
      flexGrow={0}
    >
      <Card
        variant="outlined"
        sx={{
          m: 0,
          p: 0,
          width: "100%",
          height: mh,
          borderRadius: 3,
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
          config: config,
          uioState: uioState
        })}
      </Card>
    </Grid>
  );
};

export default observer(TileCard);
