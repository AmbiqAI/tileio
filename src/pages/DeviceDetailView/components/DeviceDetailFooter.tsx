import { Divider, Stack, Toolbar } from "@mui/material";
import { observer } from "mobx-react";
import { IDevice } from "../../../models/device";
import Footer from "../../../components/Footer";
import QosBarItem from "../../../components/QosBarItem";
import UioBarItem from "../../../components/UioBarItem";


const DeviceDetailFooter = ({ device }: { device: IDevice }) => {
  return (
    <>
      <Footer>
        <Toolbar sx={{alignItems: "stretch"}}>
            <Stack
              spacing={1}
              py={0.5}
              direction="row"
              alignItems="stretch"
            >

            <QosBarItem device={device} />

            <Divider orientation="vertical" flexItem />

            <UioBarItem device={device} />

            <Divider orientation="vertical" flexItem />

            </Stack>
        </Toolbar>
      </Footer>
    </>
  );
};

export default observer(DeviceDetailFooter);
