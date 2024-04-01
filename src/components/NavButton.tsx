import { ButtonBase, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/system";

const NavButton = styled(ButtonBase)(({ theme }: { theme: Theme }) => ({
  // px: 1.0,
  // py: 1.0,
  // m: 0.5,
  borderWidth: 1.5,
  borderStyle: "solid",
  padding: "2px 3px",
  borderColor: "#0000",
  borderRadius: 4,
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
