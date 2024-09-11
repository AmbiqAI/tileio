import { useEffect } from "react";
import { SnackbarKey, useSnackbar } from "notistack";
import { Button } from "@mui/material";
import { Notifier } from "../../api";
import type { NotifierMessage } from "../../api";


const Notification = (): null => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    Notifier.on("NEW", (notification: NotifierMessage, cb) => {
      const action = (key: SnackbarKey) => (
        <>
        {(notification.options?.variant === "error") && (
          <Button
            color="inherit"
            onClick={() => {
              navigator.clipboard.writeText(notification.message);
            }}
          >
            Copy
          </Button>
        )}
        <Button
          color="inherit"
          onClick={() => {
            closeSnackbar(key);
          }}
        >
          Dismiss
        </Button>
        </>
      );
      cb(
        enqueueSnackbar(notification.message, {
          action: action,
          ...notification.options,
        })
      );
    });

    Notifier.on("REMOVE", (key) => {
      closeSnackbar(key);
    });

    Notifier.on("CLEAR", () => {
      closeSnackbar();
    });

    Notifier.start();
    return function cleanup() {
      Notifier.stop();
    };
  });

  return null;
};

export default Notification;
