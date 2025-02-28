declare global {
  namespace Express {
    interface Locals {
      userToken: { username: string };
    }
  }
}
