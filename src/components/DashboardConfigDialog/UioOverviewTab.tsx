import { observer } from "mobx-react";
import {
  Stack,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import { IUioConfig } from "../../models/uioState";
import IoConfigCard from "../IoConfigCard";

interface Props {
  uio: IUioConfig;
}

const UioOverviewTab = ({ uio }: Props) => {
  return (
    <Stack spacing={1} direction="column" justifyContent="center" height="100%" width="100%" p={2}>
      <Stack direction="row" justifyContent="flex-start" width="100%">
        <Typography variant="h6" ml={1}>I/O Setup</Typography>
      </Stack>
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >

        <Box key={`io0}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io0} index={0} />
        </Box>

        <Box key={`io1}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io1} index={1} />
        </Box>

        <Box key={`io2}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io2} index={2} />
        </Box>

        <Box key={`io3}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io3} index={3} />
        </Box>

        <Box key={`io4}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io4} index={4} />
        </Box>

        <Box key={`io5}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io5} index={5} />
        </Box>

        <Box key={`io6}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io6} index={6} />
        </Box>

        <Box key={`io7}`} sx={{ margin: 1 }}>
          <IoConfigCard io={uio.io7} index={7} />
        </Box>

      </Box>

    </Stack>
  )
}


export default observer(UioOverviewTab);
