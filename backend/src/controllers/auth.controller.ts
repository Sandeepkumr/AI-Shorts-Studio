import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { otpVerifications, users } from "../db/schema.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const generateOtp = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const sendOtp = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { phone } = request.body as { phone?: string };

  if (!phone || !/^\+\d{10,15}$/.test(phone)) {
    response.status(400).json({
      success: false,
      message: "Enter a valid mobile number.",
    });
    return;
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
  );

  await db.insert(otpVerifications).values({
    phone,
    otpHash,
    expiresAt,
    attempts: 0,
  });

  // Development only. Replace with a real SMS provider later.
  console.info(`[DEV OTP] ${phone}: ${otp}`);

  response.status(200).json({
    success: true,
    message: "OTP sent successfully.",
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  });
};

export const verifyOtp = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { phone, otp } = request.body as {
    phone?: string;
    otp?: string;
  };

  if (!phone || !/^\+\d{10,15}$/.test(phone)) {
    response.status(400).json({
      success: false,
      message: "Enter a valid mobile number.",
    });
    return;
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    response.status(400).json({
      success: false,
      message: "Enter a valid 6-digit verification code.",
    });
    return;
  }

  const [verification] = await db
    .select()
    .from(otpVerifications)
    .where(eq(otpVerifications.phone, phone))
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  if (!verification) {
    response.status(400).json({
      success: false,
      message: "No verification code was found. Please request a new code.",
    });
    return;
  }

  if (verification.verifiedAt) {
    response.status(400).json({
      success: false,
      message: "This verification code has already been used.",
    });
    return;
  }

  if (verification.expiresAt.getTime() <= Date.now()) {
    response.status(400).json({
      success: false,
      message:
        "This verification code has expired. Please request a new code.",
    });
    return;
  }

  if (verification.attempts >= MAX_OTP_ATTEMPTS) {
    response.status(429).json({
      success: false,
      message: "Too many incorrect attempts. Please request a new code.",
    });
    return;
  }

  const isValidOtp = await bcrypt.compare(otp, verification.otpHash);

  if (!isValidOtp) {
    await db
      .update(otpVerifications)
      .set({
        attempts: verification.attempts + 1,
      })
      .where(eq(otpVerifications.id, verification.id));

    response.status(400).json({
      success: false,
      message: "That verification code is incorrect. Please try again.",
    });
    return;
  }

  await db
    .update(otpVerifications)
    .set({
      verifiedAt: new Date(),
    })
    .where(eq(otpVerifications.id, verification.id));

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  let user = existingUsers[0];

  if (!user) {
    const [createdUser] = await db
      .insert(users)
      .values({
        phone,
        isProfileComplete: false,
      })
      .returning();

    user = createdUser;
  }

  response.status(200).json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      username: user.username ?? undefined,
      profileImageUrl: user.profileImageUrl ?? undefined,
      isGuest: false,
      isProfileComplete: user.isProfileComplete,
    },
  });
};

export const completeProfile = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const {
    phone,
    name,
    email,
    profileImageUrl,
  } = request.body as {
    phone?: string;
    name?: string;
    email?: string;
    profileImageUrl?: string;
  };

  if (!phone || !/^\+\d{10,15}$/.test(phone)) {
    response.status(400).json({
      success: false,
      message: "A valid phone number is required.",
    });
    return;
  }

  if (!name || name.trim().length < 2) {
    response.status(400).json({
      success: false,
      message: "Please enter your full name.",
    });
    return;
  }

  const normalizedEmail = email?.trim() || undefined;

  if (
    normalizedEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    response.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
    return;
  }

  const normalizedProfileImageUrl =
    profileImageUrl?.trim() || undefined;

  const [user] = await db
    .update(users)
    .set({
      name: name.trim(),
      email: normalizedEmail ?? null,
      profileImageUrl: normalizedProfileImageUrl ?? null,
      isProfileComplete: true,
      updatedAt: new Date(),
    })
    .where(eq(users.phone, phone))
    .returning();

  if (!user) {
    response.status(404).json({
      success: false,
      message: "User account was not found.",
    });
    return;
  }

  response.status(200).json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      username: user.username ?? undefined,
      profileImageUrl: user.profileImageUrl ?? undefined,
      isGuest: false,
      isProfileComplete: user.isProfileComplete,
    },
  });
};