import { Stack, Typography, TypographyProps } from "@mui/material"
import { GridZStack } from "./utils"

interface Props {
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  headerColor?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | string;
  subheaderColor?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | string;
}

const TileCornerLabel = ({ header, subheader, headerColor, subheaderColor }: Props) => {
  return (
    <GridZStack level={1} style={{ pointerEvents: "none" }}>
        <Stack
          width="100%"
          height="100%"
          alignItems="flex-end"
          justifyContent="flex-end"
          padding={0}
          sx={{
            userSelect: "none",
            WebkitUserSelect: "none",
            textAlign: "end",
            pr: 1.0,
            pb: 0.5,
          }}
        >
          {!!header && (
            <Typography color={headerColor} fontWeight={900} variant="h3" sx={{ lineHeight: 1 }}>
              {header}
            </Typography>
          )}
          {!!subheader && (
            <Typography color={subheaderColor} fontWeight={700} variant="h6" sx={{ lineHeight: 1 }}>
              {subheader}
            </Typography>
          )}
        </Stack>
      </GridZStack>
  );
}

export default TileCornerLabel;
