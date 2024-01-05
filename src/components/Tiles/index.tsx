import { ErrorBoundary } from "react-error-boundary"
import { TileProps, BaseTile, RegisteredTiles } from "./BaseTile";
import { Box, Button, Typography } from "@mui/material";


function ErrorTile({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Box
      p={2}
      role="alert"
      width="100%"
      height="100%"
      justifyContent="center"
      alignContent="center"
      sx={{ textAlign: "center" }}
    >
      <Typography color="error" variant="h6">Tile Failed</Typography>
      <Typography variant="body1">
        {`If problem persists, please reconfigure Tile in settings. Error: ${error.message}`}
      </Typography>
    </Box>
  );
}

export const CreateTile = (props: TileProps) => {
  const Component = RegisteredTiles[props.type]?.comp || BaseTile;

  return (
    <ErrorBoundary
      FallbackComponent={ErrorTile}
    >
      <Component {...props} />;
    </ErrorBoundary>
  );
};
