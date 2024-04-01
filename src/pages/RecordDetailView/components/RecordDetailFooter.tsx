import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Divider, Stack, Toolbar, useMediaQuery, useTheme} from '@mui/material';
import { observer } from 'mobx-react';
import { DeviceIcon } from '../../../assets/icons';
import Footer from '../../../components/Footer';
import DeviceInfoDialog from '../../../components/DeviceInfoDialog';
import { IDeviceInfo } from '../../../models/deviceInfo';
import { IRecord } from '../../../models/record';
import NavButton from '../../../components/NavButton';

const RecordDetailFooter = ({ record } : {record: IRecord }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down(500));
  const [isDeviceInfoDialogOpen, showDeviceInfoDialog] = useState(false);
  return (
    <>
    <Footer>
      <Toolbar>
      <Box sx={{flexGrow: 1}}>
      <Stack spacing={1} direction="row" alignItems="center">
        <NavButton
          onClick={() => { showDeviceInfoDialog(true); }}
        >
          <Stack spacing={1} direction="row" alignItems="center">
            <Avatar sx={{bgcolor: 'rgba(0,0,0,0)'}}>
              <DeviceIcon color="action" fontSize="large"/>
            </Avatar>
            {!isSmall && (
              <Stack spacing={-0.5} alignItems="flex-start">
                <Typography variant="button">{record.device.name}</Typography>
                <Typography variant="caption" color="text.secondary"> {record.device.location || 'NA'} </Typography>
              </Stack>
            )}
          </Stack>
        </NavButton>

        <Divider orientation="vertical" flexItem/>

        </Stack>
        </Box>
      </Toolbar>
    </Footer>
    <DeviceInfoDialog
      open={isDeviceInfoDialogOpen}
      info={record.device}
      onSubmit={async (info: IDeviceInfo) => {
        if (record) {
          await record.setDeviceInfo(info);
        }
      }}
      onClose={() => { showDeviceInfoDialog(false); }}
      disabled={false}
    />
    </>
  );
};

export default observer(RecordDetailFooter);
