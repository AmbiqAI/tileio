import { useParams } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  CircularProgress,
  Fade,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react";
import { useStore } from "../../models/store";
import Footer from "../../components/Footer";
import Record, { IRecord } from "../../models/record";
import RecordDetailHeader from "./components/RecordDetailHeader";
import RecordDetailFooter from "./components/RecordDetailFooter";
import TileCard from "./components/TileCard";

type RecordParams = {
  id: string;
};

const RecordDetailView = () => {
  const { id } = useParams<RecordParams>();
  const { root: { recordById } } = useStore();

  let record = recordById(id);

  if (record === undefined) {
    record = Record.create({ id: id });
    return (
      <Box sx={{ pb: 8, pt: 8, pl: 4 }}>
        <RecordDetailHeader record={record} disabled={true} />
        <Fade in>
          <Stack
            width="100%"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <Typography variant="h6">
              Record not found or no longer available.
            </Typography>
          </Stack>
        </Fade>
        <Footer>
          <Toolbar></Toolbar>
        </Footer>
      </Box>
    );
  }

  if (record.recording) {
    return (
      <Box sx={{ pb: 8, pt: 8, pl: 4 }}>
        <RecordDetailHeader record={record} disabled={true} />
        <Fade in>
          <Stack width="100%" justifyContent="center" alignItems="center">
            <CircularProgress thickness={6} color="inherit" sx={{ my: 2 }} />
            <Typography variant="h6">
              Recording currently in progress. Please stop to view and export
              record.
            </Typography>
          </Stack>
        </Fade>
        <Footer>
          <Toolbar></Toolbar>
        </Footer>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8, pt: "calc(1.5em + env(safe-area-inset-top))" }}>
      <RecordDetailHeader record={record} />
      <Fade in>
        <Grid
          container
          px={1}
          rowSpacing={1.0} columnSpacing={1.0}
          justifyContent="flex-start"
          alignContent="flex-start"
          alignItems="flex-start"
          width="100%"
          margin="auto"
        >
          {record.dashboard.tiles.map((item, idx) => {
            return (
              <TileCard key={`${item.name}-${idx}`}
                name={item.name}
                size={item.size}
                type={item.type}
                record={record as IRecord}
                config={item.config}
              />
            )
          })}
        </Grid>
      </Fade>
      <RecordDetailFooter record={record} />
    </Box>
  );
};

export default observer(RecordDetailView);
