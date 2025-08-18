import bcrypt from "bcryptjs";

const SALT_ROUNDS = 5;
export async function hashPassword(plainPassword: string) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const ha = await bcrypt.hash(plainPassword, salt);
    return ha;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  return match; // true if passwords match
}
