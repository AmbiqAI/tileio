import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import NavButton from '../../../components/NavButton';
import { IDashboard } from '../../../models/dashboard';
import DashboardConfigDialog from '../../../components/DashboardConfigDialog';
import { Avatar, Chip, Divider, Stack } from '@mui/material';
import DashboardChips from '../../../components/DashboardChips';

interface Props {
  dashboard: IDashboard;
}

const DashboardInfoBarItem = ({ dashboard }: Props) => {

  const [isDashboardConfigDialogOpen, showDashboardConfigDialog] = useState(false);

  return (
    <>
      <Stack
        spacing={0}
        py={0.0}
        direction="row"
        alignItems="stretch"
      >
      <Divider orientation="vertical" flexItem />
      <NavButton
        onClick={() => { showDashboardConfigDialog(true); }}
        sx={{px: 1}}
      >
        <Stack direction="column" justifyContent="start" alignSelf="end">
          <Stack direction="row" justifyContent="start" alignItems="center">
            {/* <DashboardRoundedIcon /> */}
            <Typography variant="h6">{dashboard.name}</Typography>
          </Stack>

          <DashboardChips dashboard={dashboard} size="small" color="secondary" />

        </Stack>

      </NavButton>
      <Divider orientation="vertical" flexItem />
      </Stack>
      <DashboardConfigDialog
        dashboard={dashboard}
        open={isDashboardConfigDialogOpen}
        onClose={() => { showDashboardConfigDialog(false); }}
        disabled={false}
      />
    </>
  )
};

export default observer(DashboardInfoBarItem);
