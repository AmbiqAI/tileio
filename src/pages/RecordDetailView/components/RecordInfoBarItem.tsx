import { Divider, Stack, Typography } from "@mui/material";
import { IRecord } from "../../../models/record";
import { observer } from "mobx-react";

interface Props {
  record: IRecord;
  size: "small" | "medium";
}

const RecordInfoBarItem = ({ record, size }: Props) => {
  const isSmall = size === "small";
  return (
    <Stack
      spacing={0}
      py={0.0}
      direction="row"
      alignItems="stretch"
    >
      <Divider orientation="vertical" flexItem />
      <Stack direction="column" spacing={0} alignItems="flex-start" px={1}>
        <Typography variant={isSmall ? "subtitle1" : "h6"} fontWeight={700}>{`Record ${record.shortId}`}</Typography>
        <Stack spacing={-0.5} flexDirection="row" alignItems="center">
          <Typography variant="subtitle2" color="text.secondary">
            {`${record.date.toLocaleDateString()} | ${record.durationHMS}`}
          </Typography>
        </Stack>
      </Stack>
      <Divider orientation="vertical" flexItem />
    </Stack>
  )
}

export default observer(RecordInfoBarItem);
