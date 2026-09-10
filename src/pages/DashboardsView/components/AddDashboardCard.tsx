// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { useState } from "react";
import { observer } from "mobx-react";
import Typography from "@mui/material/Typography";
import { Card, CardActionArea, CardContent, Stack } from "@mui/material";
import AddDashboardDialog from "../../../components/NewDashboardDialog";
import AddIcon from '@mui/icons-material/AddCircleOutlineRounded';

const AddDashboardCard = () => {
  const [isAddDashboardDialogOpen, showAddDashboardDialog] = useState(false);

  return (
    <>
      <Card
        elevation={3}
        sx={{
          borderRadius: 4,

          marginY: "52px",
          marginX: "108px",
          height: 150,
          width: 150,
          textAlign: "center",
        }}
      >
        <CardActionArea sx={{ p: 2 }} onClick={() => showAddDashboardDialog(true)}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Add Dashboard
          </Typography>

          <CardContent >
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <AddIcon fontSize="large" />
            </Stack>

          </CardContent>
        </CardActionArea>
      </Card>
      <AddDashboardDialog
        open={isAddDashboardDialogOpen}
        close={() => {
          showAddDashboardDialog(false);
        }}
      />
    </>

  );
}


export default observer(AddDashboardCard);
