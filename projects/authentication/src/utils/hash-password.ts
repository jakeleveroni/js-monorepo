import bcrypt from 'bcryptjs';

export async function saltAndHashPassword(password: string) {
  const salt = await bcrypt.genSalt(4);
  const hashed = await bcrypt.hash(password, salt);
  return {
    salt,
    hashed,
  };
}
