export type User = {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
};

export type Session = {
    token: string;
    expiresAt: Date;
};

export type UserSession = {
    user: User;
    session: Session;
};
