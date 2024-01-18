import { IconButton, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import EventIcon from "@mui/icons-material/AddLocation";
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack, useDebounce } from "./utils";

export const EventTileSpec: TileSpec = {
  type: "EVENT_TILE",
  name: "Event Tile",
  description: "Add event marker",
  streamingRequired: false,
  sizes: ["sm", "md"],
  schema: {},
};

const EventTile = observer(({ record }: TileProps) => {
  const addEventTh = useDebounce(async () => {
    await record?.addEvent();
  }, 500);

  return (
    <GridContainer>
      <GridZStack level={0}>
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          sx={{
            p: 1.5,
            pt: 2
          }}
        >
          <IconButton
            color="primary"
            disabled={!record || !record.recording}
            onClick={addEventTh}
            sx={{
              borderWidth: "2px",
              borderStyle: "solid",
              borderRadius: "50%",
              height: "65%",
              width: "auto",
              aspectRatio: "1",
            }}
          >
            <EventIcon
              fontSize="inherit"
              sx={{ width: "70%", height: "70%" }}
            />
          </IconButton>
        </Stack>
      </GridZStack>

      <GridZStack level={1} style={{pointerEvents: "none"}}>
        <Stack
          width="100%"
          height="100%"
          alignItems="flex-end"
          justifyContent="flex-end"
          padding={0}
          sx={{
            userSelect: "none",
            WebkitUserSelect: "none",
            textAlign: "end",
            pr: 0.5,
            pb: 0.5,
          }}
        >
          <Typography fontWeight={800} variant="h6" sx={{ lineHeight: 1 }}>
            ADD<br></br>Marker
          </Typography>
        </Stack>
      </GridZStack>

    </GridContainer>
  );
});

export default EventTile;
