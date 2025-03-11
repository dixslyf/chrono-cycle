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
