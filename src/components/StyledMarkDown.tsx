import { useTheme } from "@mui/material";
import Markdown from "react-markdown";

interface Props {
  children: string;
}

const StyledMarkDown = ({ children }: Props) => {
  const theme = useTheme();
  return (
    <Markdown
      components={{
        h1: ({ children }) => <h1 style={{ color: theme.palette.primary.main, margin: 4, fontSize: '2.0rem' }}>{children}</h1>,
        h2: ({ children }) => <h2 style={{ color: theme.palette.primary.main, margin: 4, fontSize: '1.8rem' }}>{children}</h2>,
        h3: ({ children }) => <h3 style={{ color: theme.palette.primary.main, margin: 4, fontSize: '1.6rem' }}>{children}</h3>,
        h4: ({ children }) => <h4 style={{ color: theme.palette.primary.main, margin: 4, fontSize: '1.4rem' }}>{children}</h4>,
        h5: ({ children }) => <h5 style={{ color: theme.palette.primary.main, margin: 4, fontSize: '1.2rem' }}>{children}</h5>,
        h6: ({ children }) => <h6 style={{ color: theme.palette.primary.main, margin: 4, fontSize: '1.0rem' }}>{children}</h6>,
        p: ({ children }) => <p style={{ margin: 4, fontSize: '0.9rem' }}>{children}</p>,
      }}
    >
      {children}
    </Markdown>
  );
}

export default StyledMarkDown;
