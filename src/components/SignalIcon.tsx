import Signal0Icon from '@mui/icons-material/SignalWifi0Bar';
import Signal1Icon from '@mui/icons-material/SignalWifi1Bar';
import Signal2Icon from '@mui/icons-material/SignalWifi2Bar';
import Signal3Icon from '@mui/icons-material/SignalWifi3Bar';
import Signal4Icon from '@mui/icons-material/SignalWifi4Bar';
import { SvgIconProps, Tooltip } from '@mui/material';

interface Props extends SvgIconProps {
  level: number
}

const SignalIcon = (props: Props) => {
  const SignalLevels = [
    Signal0Icon,
    Signal1Icon,
    Signal2Icon,
    Signal3Icon,
    Signal4Icon,
  ];
  const { level, ...cprops } = props;
  const levelIndex = Math.min(Math.max(0, Math.ceil(level/20)), 4);
  const Component = SignalLevels[levelIndex];
  return (
    <Tooltip arrow title={level.toFixed(0)}>
      <Component {...cprops} />
    </Tooltip>
  );
}

export default SignalIcon;
