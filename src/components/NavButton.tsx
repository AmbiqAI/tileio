import { ButtonBase, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/system";

const NavButton = styled(ButtonBase)(({ theme }: { theme: Theme }) => ({
  borderWidth: "0px 2px 0px 2px",
  borderStyle: "solid",
  padding: "2px 3px",
  borderColor: "#0000",
  borderRadius: 0,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    borderColor: alpha(theme.palette.primary.main, 0.6),
  },
  "&:focus": {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    borderColor: alpha(theme.palette.primary.main, 0.6),
  },
}));

export default NavButton;
