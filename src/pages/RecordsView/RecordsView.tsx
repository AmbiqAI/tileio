import { observer } from "mobx-react";
import { Box } from "@mui/system";
import RecordsTable from "./components/RecordsTable";
import RecordsHeader from "./components/RecordsHeader";
import { HeaderOffset } from "../../components/Header";

const RecordsView = () => {
  return (
    <Box sx={{ pb: 8, width: "100%" }}>
      <RecordsHeader />
      <HeaderOffset />
      <Box sx={{ display: "flex", p: 2, justifyContent: "center" }}>
        <RecordsTable />
      </Box>
    </Box>
  );
};

export default observer(RecordsView);
