export type User = {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
};

export type Session = {
    id: string;
    expiresAt: Date;
};

export type UserSession = {
    user: User;
    session: Session;
};

export type UserSettings = {
    startDayOfWeek: "Monday" | "Sunday";
    dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY/MM/DD";
    enableEmailNotifications: boolean;
    enableDesktopNotifications: boolean;
};
