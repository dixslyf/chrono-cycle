import { type NotificationData, notifications } from "@mantine/notifications";
import { CircleX, CircleCheck } from "lucide-react";

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

export function notifyError(notification: NotificationData) {
    notifications.show({ ...DEFAULT_ERROR_DATA, ...notification });
}

export function notifySuccess(notification: NotificationData) {
    notifications.show({ ...DEFAULT_SUCCESS_DATA, ...notification });
}
