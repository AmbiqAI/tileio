import { Box } from "@mui/system";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../models/store";

const RecordsGrid = () => {
  const {
    root: { records },
  } = useStore();
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", p: 2, flexWrap: "wrap" }}
    >
      {records.map((record) => {
        return (
          <div key={`recordcard-${record.id}`} style={{ margin: 8 }}></div>
        );
      })}
    </Box>
  );
};

export default observer(RecordsGrid);
