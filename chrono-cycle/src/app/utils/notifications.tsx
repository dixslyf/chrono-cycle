import { notifications, type NotificationData } from "@mantine/notifications";
import { CircleCheck, CircleX } from "lucide-react";

const DEFAULT_ERROR_DATA = {
    title: "An error occurred!",
    color: "red",
    icon: <CircleX />,
};

const DEFAULT_SUCCESS_DATA = {
    title: "Success!",
    color: "teal",
    icon: <CircleCheck />,
};

const AUTH_STYLE = {
    autoClose: 8000,
    position: "bottom-center",
    withBorder: true,
    style: {
        bottom: "15vh",
    },
} as const;

export function notifyError(
    notification: NotificationData,
    config?: { authStyle?: boolean },
) {
    notifications.show({
        ...DEFAULT_ERROR_DATA,
        ...(config?.authStyle ? AUTH_STYLE : {}),
        ...notification,
    });
}

export function notifySuccess(
    notification: NotificationData,

    config?: { authStyle?: boolean },
) {
    notifications.show({
        ...DEFAULT_SUCCESS_DATA,
        ...(config?.authStyle ? AUTH_STYLE : {}),
        ...notification,
    });
}
