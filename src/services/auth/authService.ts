import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthUser = {
  id: string;
  phone?: string;
  name?: string;
  email?: string;
  username?: string;
  profileImageUrl?: string;
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
  email?: string;
  username?: string;
  profileImageUrl?: string;
};

const API_BASE_URL = "https://evasive-twiddling-lunacy.ngrok-free.dev";
const STORAGE_KEY = "@shivora/current_user";

let currentUser: AuthUser | null = null;

const request = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
    },
  );

  const data = (await response.json()) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      data.message ?? "Something went wrong.",
    );
  }

  return data;
};

const persistUser = async (
  user: AuthUser | null,
): Promise<void> => {
  currentUser = user;

  if (!user) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(user),
  );
};

const restoreUser = async (): Promise<AuthUser | null> => {
  if (currentUser) {
    return { ...currentUser };
  }

  try {
    const storedUser = await AsyncStorage.getItem(
      STORAGE_KEY,
    );

    if (!storedUser) {
      return null;
    }

    const parsedUser = JSON.parse(storedUser) as AuthUser;

    currentUser = parsedUser;

    return { ...parsedUser };
  } catch (error) {
    console.error(
      "Failed to restore Shivora user session:",
      error,
    );

    await AsyncStorage.removeItem(STORAGE_KEY);
    currentUser = null;

    return null;
  }
};

export const authService = {
  async loginWithPhone(
    phone: string,
  ): Promise<LoginResult> {
    const normalizedPhone = phone.replace(/\s/g, "");

    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      throw new Error("Enter a valid mobile number.");
    }

    await request<{
      success: boolean;
      message: string;
    }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({
        phone: normalizedPhone,
      }),
    });

    return {
      phone: normalizedPhone,
    };
  },

  async verifyOtp(
    phone: string,
    otp: string,
  ): Promise<OtpVerificationResult> {
    try {
      const result = await request<{
        success: boolean;
        user?: AuthUser;
        message?: string;
      }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          phone,
          otp,
        }),
      });

      if (result.success && result.user) {
        await persistUser(result.user);
      }

      return {
        success: result.success,
        user: result.user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify this code.",
      };
    }
  },

  async completeProfile({
    name,
    email,
    username,
    profileImageUrl,
  }: ProfileInput): Promise<AuthUser> {
    const existingUser = await restoreUser();

    if (
      !existingUser ||
      existingUser.isGuest ||
      !existingUser.phone
    ) {
      throw new Error("No authenticated user is available.");
    }

    const result = await request<{
      success: boolean;
      user?: AuthUser;
      message?: string;
    }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({
        phone: existingUser.phone,
        name: name.trim(),
        email: email?.trim() || undefined,
        username: username?.trim() || undefined,
        profileImageUrl:
          profileImageUrl?.trim() || undefined,
      }),
    });

    if (!result.success || !result.user) {
      throw new Error(
        result.message ?? "Unable to save profile.",
      );
    }

    const updatedUser: AuthUser = {
      ...existingUser,
      ...result.user,
      phone:
        result.user.phone ?? existingUser.phone,
      name:
        result.user.name ?? name.trim(),
      email:
        result.user.email ??
        email?.trim() ??
        existingUser.email,
      username:
        result.user.username ??
        username?.trim() ??
        existingUser.username,
      profileImageUrl:
        result.user.profileImageUrl ??
        profileImageUrl?.trim() ??
        existingUser.profileImageUrl,
      isGuest: false,
      isProfileComplete: true,
    };

    await persistUser(updatedUser);

    return { ...updatedUser };
  },

  async continueAsGuest(): Promise<AuthUser> {
    const guestUser: AuthUser = {
      id: `guest-${Date.now()}`,
      name: "Guest",
      isGuest: true,
      isProfileComplete: true,
    };

    await persistUser(guestUser);

    return { ...guestUser };
  },

  async logout(): Promise<void> {
    currentUser = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    return restoreUser();
  },
};