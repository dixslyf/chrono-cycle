import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { ReactNode } from "react";

import { retrieveUserInfoAction } from "@/features/auth/retrieveUserInfo/action";

import NavbarClient from "./navbarClient";

export async function Navbar(): Promise<ReactNode> {
    const userInfoResult = await retrieveUserInfoAction();
    const usernameResult = pipe(
        userInfoResult,
        E.map((userInfo) => userInfo.username),
    );
    return <NavbarClient usernameResult={usernameResult} />;
}
