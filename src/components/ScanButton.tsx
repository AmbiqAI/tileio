import { styled } from "@mui/system";
import { Button } from "@mui/material";

interface ScanButtonProps {
  scanning?: string
};

export const ScanButton = styled(Button)<ScanButtonProps>`
  & svg {
    @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
    overflow: hidden;
    animation: ${(props: ScanButtonProps) => props.scanning ? 'spin 1.0s linear infinite' : 'none'};
  }
`;
