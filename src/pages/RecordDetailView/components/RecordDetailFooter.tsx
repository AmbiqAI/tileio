import { Divider, Stack, Toolbar } from '@mui/material';
import { observer } from 'mobx-react';
import Footer from '../../../components/Footer';
import { IRecord } from '../../../models/record';
import DashboardInfoBarItem from '../../DashboardDetailView/components/DashboardInfoBarItem';

const RecordDetailFooter = ({ record }: { record: IRecord }) => {
  return (
    <>
      <Footer>
        <Toolbar>
          <Stack
            spacing={0}
            py={0.0}
            direction="row"
            alignItems="stretch"
          >
            <DashboardInfoBarItem dashboard={record.dashboard} />

            <Divider orientation="vertical" flexItem />

          </Stack>
        </Toolbar>
      </Footer>
    </>
  );
};

export default observer(RecordDetailFooter);
