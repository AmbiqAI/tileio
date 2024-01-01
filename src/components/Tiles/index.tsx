import { TileProps, BaseTile, RegisteredTiles } from "./BaseTile";

export const CreateTile = (props: TileProps) => {
  const Component = RegisteredTiles[props.type]?.comp || BaseTile;
  return <Component {...props} />;
};
