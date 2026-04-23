import { account, ID } from "./appwrite.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  const compact = normalizeEmail(email);
  if (!compact) {
    return "Please enter your email address";
  }
  if (!/^\S+@\S+\.\S+$/.test(compact)) {
    return "Please enter a valid email address";
  }
  return "";
}

function validatePassword(password) {
  if (!password) {
    return "Please enter your password";
  }
  if (password.length < 6) {
    return `Password too short (${password.length}/6 chars minimum)`;
  }
  return "";
}

function validateName(name) {
  if (!name || name.trim().length < 2) {
    return "Please enter your full name";
  }
  return "";
}

function validateCity(city) {
  if (!city || city.trim().length < 2) {
    return "Please enter your city";
  }
  return "";
}

function validateDailyRate(rate) {
  const r = Number(rate || 0);
  if (!r) {
    return "Please set a daily rate";
  }
  if (r < 100) {
    return `Rate too low (minimum ₹100, you set ₹${r})`;
  }
  if (r > 10000) {
    return "Rate seems too high (max ₹10,000)";
  }
  return "";
}

function validateLoginForm({ email, password }) {
  return {
    email: validateEmail(email),
    password: validatePassword(password)
  };
}

function validateRegisterForm(payload) {
  const errors = {
    role: payload.role ? "" : "Please choose who you are",
    name: validateName(payload.name),
    email: validateEmail(payload.email),
    password: validatePassword(payload.password)
  };

  return errors;
}

function hasErrors(errorMap) {
  return Object.values(errorMap).some(Boolean);
}

function logAuthError(action, error, context = {}) {
  const safeError = {
    message: error?.message || "Unknown Appwrite error",
    code: error?.code,
    type: error?.type,
    response: error?.response
  };
  console.error(`[Auth:${action}]`, {
    ...context,
    error: safeError
  });
}

async function loginWithEmailPassword(email, password) {
  const errors = validateLoginForm({ email, password });
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  try {
    const session = await account.createEmailPasswordSession(normalizeEmail(email), password);
    return { ok: true, session, errors: {} };
  } catch (error) {
    const isActiveSessionError =
      error?.type === "user_session_already_exists" ||
      error?.code === 401 && String(error?.message || "").toLowerCase().includes("session is active");

    if (isActiveSessionError) {
      try {
        await account.deleteSession("current");
        const session = await account.createEmailPasswordSession(normalizeEmail(email), password);
        return { ok: true, session, errors: {} };
      } catch (retryError) {
        logAuthError("loginWithEmailPasswordRetry", retryError, { email: normalizeEmail(email) });
        return {
          ok: false,
          errors: {
            email: "",
            password: "You're already signed in. Please log out first and try again."
          },
          error: retryError
        };
      }
    }

    logAuthError("loginWithEmailPassword", error, { email: normalizeEmail(email) });
    return {
      ok: false,
      errors: {
        email: "",
        password: "Email or password is incorrect."
      },
      error
    };
  }
}

async function registerUser(payload) {
  const errors = validateRegisterForm(payload);
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  const userId = ID.unique();
  const email = normalizeEmail(payload.email);

  try {
    const user = await account.create(userId, email, payload.password, payload.name);

    try {
      await account.createEmailPasswordSession(email, payload.password);
    } catch (sessionError) {
      const isActiveSessionError =
        sessionError?.type === "user_session_already_exists" ||
        sessionError?.code === 401 && String(sessionError?.message || "").toLowerCase().includes("session is active");

      if (isActiveSessionError) {
        try {
          await account.deleteSession("current");
          await account.createEmailPasswordSession(email, payload.password);
        } catch (retrySessionError) {
          console.warn("Session creation retry failed after registration", {
            email,
            message: retrySessionError?.message,
            code: retrySessionError?.code,
            type: retrySessionError?.type,
            response: retrySessionError?.response
          });
        }
      }

      console.warn("Session creation failed after registration", {
        email,
        message: sessionError?.message,
        code: sessionError?.code,
        type: sessionError?.type,
        response: sessionError?.response
      });
    }

    return { ok: true, user, errors: {} };
  } catch (error) {
    logAuthError("registerUser", error, {
      email,
      role: payload.role,
      city: payload.city || null,
      workType: payload.workType || null
    });
    const message = String(error?.message || "").toLowerCase();
    const duplicate = message.includes("already") || message.includes("exist");
    return {
      ok: false,
      errors: {
        email: duplicate ? "This email is already registered" : "Could not create account. Please try again."
      },
      error
    };
  }
}

async function loginWithGoogle(successUrl, failureUrl) {
  try {
    const session = await account.createOAuth2Session("google", successUrl, failureUrl);
    return session;
  } catch (error) {
    logAuthError("loginWithGoogle", error, { successUrl, failureUrl });
    throw error;
  }
}

async function getCurrentUser() {
  try {
    const user = await account.get();
    return { ok: true, user };
  } catch {
    return { ok: false, user: null };
  }
}

async function logout() {
  try {
    await account.deleteSession("current");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export {
  normalizeEmail,
  validateLoginForm,
  validateRegisterForm,
  hasErrors,
  loginWithEmailPassword,
  loginWithGoogle,
  registerUser,
  getCurrentUser,
  logout
};
