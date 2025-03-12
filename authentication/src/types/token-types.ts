import type { JwtPayload } from "jsonwebtoken";

export type JwtTokenContent = JwtPayload & {
    username: string;
    role: string;
}