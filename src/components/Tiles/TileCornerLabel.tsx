// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

import { Stack, Typography } from "@mui/material"
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
            pr: 1.5,
            pb: 1.25,
          }}
        >
          {!!header && (
            <Typography color={headerColor} fontWeight={600} variant="h3" sx={{ lineHeight: 1.05, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums' }}>
              {header}
            </Typography>
          )}
          {!!subheader && (
            <Typography color={subheaderColor} fontWeight={500} variant="body2" sx={{ lineHeight: 1.4, letterSpacing: '0.02em' }}>
              {subheader}
            </Typography>
          )}
        </Stack>
      </GridZStack>
  );
}

export default TileCornerLabel;
