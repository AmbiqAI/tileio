import { useHistory } from 'react-router-dom';
import { IconButton, Stack, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { observer } from 'mobx-react';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import Header from '../../../components/Header';
import { IRecord } from '../../../models/record';
import RecordInfoBarItem from './RecordInfoBarItem';
import RecordDetailMenu from './RecordDetailMenu';

const RecordDetailHeader = ({ record, disabled }: { record: IRecord, disabled?: boolean }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down(500));
  const history = useHistory();

  return (
    <Header>
      <Toolbar disableGutters sx={{ alignItems: "stretch" }}>
        <IconButton
          size="large" edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mx: 0.5, my: "auto" }}
          onClick={async () => {
            if (!record.recording) { await record.close(); }
            history.push('/records');
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="stretch"
          width="100%"
        >
          <RecordInfoBarItem record={record} size={isSmall ? "small" : "medium"} />
          <Stack direction="row">
            {/* {!isSmall && (<IconButton
              sx={{ ml: 1, mx: 0.5, my: "auto" }}
              size="large" aria-label="share" color="primary"
              disabled={disabled}
              onClick={() => { showShareDialog(true); }}
            >
              <ShareIcon />
            </IconButton>)} */}

            <RecordDetailMenu record={record} disabled={disabled} />
          </Stack>
        </Stack>
      </Toolbar>

    </Header>
  )
};

export default observer(RecordDetailHeader);
