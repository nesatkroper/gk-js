export const runtime = 'nodejs';
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";


// Create a key Uint8Array
function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function generateToken(payload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'authId' in payload &&
      'role' in payload &&
      'status' in payload
    ) {
      return payload;
    }
    return null;
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

export async function verifyPassword(
  password,
  hashedPassword
) {
  return bcrypt.compare(password, hashedPassword);
}

