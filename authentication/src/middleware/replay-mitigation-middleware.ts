import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import pool from '../utils/db-pool';
import { isJwtIdValid } from "../services/jwt-mem-cache";
import type { RequestHandler } from "express";
import type { JwtPayload } from 'jsonwebtoken';

export const replayMitigationMiddleware: RequestHandler = (req, res, next) => {
    const refreshToken: string | undefined = req.cookies.refresh_token

    if (!refreshToken) {
        next();
        return;
    }

    if (!process.env.JWT_REFRESH_SECRET) {
        res.status(500).json({ message: 'Cannot validate authenticate at this time'})
        return;
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err || !decoded || typeof decoded === 'string') {
            logger.error(err, "Unable to decode refresh token")
            next(new Error(JSON.stringify(err)));
            return;
        }

        if (isJwtIdValid((decoded as JwtPayload).jti)) {
            next();
            return;
        } else {
            const client = await pool.connect();
            try {
                await client.query("DELETE FROM users WHERE id = $1", [decoded.username])    
            } catch(err) {
                logger.error(err, "Failed to invalidate refresh token from replay attack");
            } finally {
                logger.error({err, jwt: decoded }, "[SECURITY]: REPLAY ATTACK DETECTED");
                client.release();
                res.clearCookie('auth_token')
                res.clearCookie('refresh_token')
                res.status(401).json({ message: "unathenticated" });
            }
        }
    })
}