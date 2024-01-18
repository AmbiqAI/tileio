import { Divider, Stack, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { IDevice } from "../../../models/device";
import Footer from "../../../components/Footer";
import QosBarItem from "../../../components/QosBarItem";
import UioBarItem from "../../../components/UioBarItem";


const DeviceDetailFooter = ({ device }: { device: IDevice }) => {
  return (
    <>
      <Footer>
        <Toolbar>
            <Stack
              spacing={1}
              py={0}
              direction="row"
              alignItems="stretch"
              height="100%"
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
