import { observer } from "mobx-react";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Theme,
} from "@mui/material";
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { IDashboard } from "../../models/dashboard";
import DashboardDetailMenu from "../DashboardDetailMenu";
import StyledMarkDown from "../StyledMarkDown";
import DashboardChips from "../DashboardChips";
import { IDevice } from "../../models/device";
import DeviceChips from "../DeviceChips";

interface Props {
  dashboard: IDashboard
  device?: IDevice | null
}

const DashboardCard = ({ dashboard, device }: Props) => {
  const history = useHistory();
  return (
    <Card
      elevation={3}
      sx={{
        m: 2,
        borderRadius: 4,
        borderWidth: !!device ? 2 : 0,
        borderStyle: "solid",
        borderColor: "primary.main",
        width: 350,
        margin: "auto",
        bgcolor: (theme: Theme) =>
          theme.palette.mode === "dark"
            ? `rgba(0,0,0,0.6)`
            : `rgba(255,255,255,0.9`,
        backdropFilter: "blur(20px)",
      }}
    >
      <CardActionArea sx={{ borderRadius: 0 }} onClick={() => history.push(dashboard.path)}>
        <CardHeader
          avatar={
            <Avatar
              variant="rounded"
              sx={{ marginRight: "0px", bgcolor: "rgba(0,0,0,0)" }}
            >
              <DashboardRoundedIcon color="action" fontSize="large" />
            </Avatar>
          }
          title={dashboard.name}
          titleTypographyProps={{ variant: "h6", lineHeight: "normal" }}
        />

        <Divider />

        <CardContent sx={{ height: 100, overflowY: "scroll", pt: 0 }} >
          <StyledMarkDown>
            {dashboard.description}
          </StyledMarkDown>
        </CardContent>
      </CardActionArea>

      <Divider />

      <CardActions disableSpacing>
        <Stack
          sx={{
            px: 1,
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          {!device ? (
            <DashboardChips dashboard={dashboard} size="medium" color="secondary" />
          ) : (
            <DeviceChips device={device} size="medium" color="primary" />
          )}

          <DashboardDetailMenu dashboard={dashboard} color="secondary" />
        </Stack>
      </CardActions>
    </Card>
  );
};

DashboardCard.defaultProps = {
  device: null,
};

export default observer(DashboardCard);
