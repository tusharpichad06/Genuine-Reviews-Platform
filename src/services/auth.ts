import { supabase } from "@/lib/supabase";

type SignUpData = {
  username: string;
  email: string;
  password: string;
};

// ----------------------
// Login
// ----------------------

export async function login(
  email: string,
  password: string
) {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

  if (error) {
    console.error("LOGIN ERROR:", error);

    if (
      error.message
        .toLowerCase()
        .includes("email not confirmed")
    ) {
      throw new Error(
        "Email not confirmed. Please verify your email before logging in."
      );
    }

    if (
      error.message
        .toLowerCase()
        .includes("invalid login credentials")
    ) {
      throw new Error(
        "Invalid email or password."
      );
    }

    throw error;
  }

  return data;
}

// ----------------------
// Signup
// ----------------------

export async function signUp({
  username,
  email,
  password,
}: SignUpData) {
  const cleanEmail =
    email.trim().toLowerCase();

  const { data, error } =
    await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    });

  if (error) {
    console.error(
      "SIGNUP ERROR:",
      error
    );

    throw error;
  }

  return data;
}

// ----------------------
// Google Login
// ----------------------

export async function loginWithGoogle(
  redirectTo?: string
) {
  const finalRedirectTo =
    redirectTo ||
    `${window.location.origin}/`;

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: finalRedirectTo,
      },
    });

  if (error) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    throw error;
  }

  return data;
}

// ----------------------
// Logout
// ----------------------

export async function logout() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    console.error(
      "LOGOUT ERROR:",
      error
    );

    throw error;
  }
}

// ----------------------
// Reset Password
// ----------------------

export async function resetPassword(
  email: string
) {
  const cleanEmail =
    email.trim().toLowerCase();

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo:
          `${window.location.origin}/reset-password`,
      }
    );

  if (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    throw error;
  }
}

// ----------------------
// Current User
// ----------------------

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return null;
  }

  return user;
}