import { Divider, Stack, Toolbar } from "@mui/material";
import { observer } from "mobx-react";
import { IDevice } from "../../../models/device";
import Footer from "../../../components/Footer";
import QosBarItem from "../../../components/QosBarItem";
import UioBarItem from "../../../components/UioBarItem";
import { IDashboard } from "../../../models/dashboard";

interface Props {
  dashboard: IDashboard;
  device: IDevice;
}

const DashboardDetailFooter = ({ dashboard, device }: Props) => {
  return (
    <>
      <Footer>
        <Toolbar sx={{alignItems: "stretch"}}>
            <Stack
              spacing={0}
              py={0.0}
              direction="row"
              alignItems="stretch"
            >

            <QosBarItem slots={device.slots} dashboard={dashboard} />

            <Divider orientation="vertical" flexItem />

            <UioBarItem device={device} dashboard={dashboard} />

            <Divider orientation="vertical" flexItem />

            </Stack>
        </Toolbar>
      </Footer>
    </>
  );
};

export default observer(DashboardDetailFooter);
