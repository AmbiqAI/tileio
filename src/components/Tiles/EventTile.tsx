import { IconButton, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react";
import EventIcon from "@mui/icons-material/AddLocation";
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack, useDebounce } from "./utils";
import TileCornerLabel from "./TileCornerLabel";
import { ThemeColors } from "../../theme/theme";

export const EventTileSpec: TileSpec = {
  type: "EVENT_TILE",
  name: "Event Tile",
  description: "Add event marker",
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

      <TileCornerLabel
        subheader={
          <span>
            ADD<br></br>Marker
          </span>
        }
        subheaderColor={ThemeColors.colors.secondaryColor}
      />

    </GridContainer>
  );
});

export default EventTile;
