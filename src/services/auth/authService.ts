export type AuthUser = {
  id: string;
  phone?: string;
  name?: string;
  username?: string;
  isGuest: boolean;
  isProfileComplete: boolean;
};

type LoginResult = {
  phone: string;
};

type OtpVerificationResult = {
  success: boolean;
  user?: AuthUser;
  error?: string;
};

type ProfileInput = {
  name: string;
  username?: string;
};

const mockDelay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const profilesByPhone = new Map<string, AuthUser>();
let currentUser: AuthUser | null = null;
let pendingPhone: string | null = null;

const cloneUser = (user: AuthUser): AuthUser => ({ ...user });

export const authService = {
  async loginWithPhone(phone: string): Promise<LoginResult> {
    const normalizedPhone = phone.replace(/\s/g, "");

    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      throw new Error("Enter a valid mobile number.");
    }

    await mockDelay(450);
    pendingPhone = normalizedPhone;

    return { phone: normalizedPhone };
  },

  async verifyOtp(phone: string, otp: string): Promise<OtpVerificationResult> {
    await mockDelay(500);

    if (phone !== pendingPhone || otp !== "123456") {
      return {
        success: false,
        error: "That verification code is incorrect. Please try again.",
      };
    }

    const existingUser = profilesByPhone.get(phone);
    const user = existingUser
      ? cloneUser(existingUser)
      : {
          id: `user-${phone.replace(/\D/g, "")}`,
          phone,
          isGuest: false,
          isProfileComplete: false,
        };

    currentUser = user;
    pendingPhone = null;

    return { success: true, user: cloneUser(user) };
  },

  async completeProfile({ name, username }: ProfileInput): Promise<AuthUser> {
    if (!currentUser || currentUser.isGuest) {
      throw new Error("No authenticated user is available for profile setup.");
    }

    await mockDelay(350);
    currentUser = {
      ...currentUser,
      name: name.trim(),
      username: username?.trim() || undefined,
      isProfileComplete: true,
    };

    if (currentUser.phone) {
      profilesByPhone.set(currentUser.phone, cloneUser(currentUser));
    }

    return cloneUser(currentUser);
  },

  async continueAsGuest(): Promise<AuthUser> {
    await mockDelay(250);
    currentUser = {
      id: `guest-${Date.now()}`,
      name: "Guest",
      isGuest: true,
      isProfileComplete: true,
    };

    return cloneUser(currentUser);
  },

  async logout(): Promise<void> {
    await mockDelay(150);
    currentUser = null;
    pendingPhone = null;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    await mockDelay(100);
    return currentUser ? cloneUser(currentUser) : null;
  },
};
