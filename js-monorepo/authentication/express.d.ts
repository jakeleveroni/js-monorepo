import { Response } from 'express';

declare global {
  namespace Express {
    interface Locals {
      username: string;
      permissions?: string[];
    }
    interface Response {
      locals: Locals;
    }
  }
}
