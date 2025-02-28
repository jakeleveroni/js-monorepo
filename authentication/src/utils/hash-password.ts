import bcrypt from "bcryptjs";
import logger from "./logger";

export async function saltAndHashPassword(username: string, password: string) {
  const salt = await bcrypt.genSalt(4);
  const hashed = await bcrypt.hash(password, salt);
  return {
    salt,
    hashed,
  };
}
