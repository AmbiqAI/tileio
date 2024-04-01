import { observer } from "mobx-react";
import { Box } from "@mui/system";
import RecordsTable from "./components/RecordsTable";
import RecordsHeader from "./components/RecordsHeader";

const RecordsView = () => {
  return (
    <Box sx={{ pb: 8, pt: "calc(1em + env(safe-area-inset-top))" }}>
      <RecordsHeader />
      <Box sx={{ display: "flex", p: 2, justifyContent: "center" }}>
        <RecordsTable />
      </Box>
    </Box>
  );
};

export default observer(RecordsView);
