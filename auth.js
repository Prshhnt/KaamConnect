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
    return "Password should be at least 6 characters";
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
    password: validatePassword(payload.password),
    city: validateCity(payload.city)
  };

  if (payload.role === "worker") {
    if (!payload.workType) {
      errors.workType = "Please choose your work type";
    } else {
      errors.workType = "";
    }
    const rate = Number(payload.dailyRate || 0);
    if (!rate || rate < 100) {
      errors.dailyRate = "Please choose your daily rate";
    } else {
      errors.dailyRate = "";
    }
  }

  return errors;
}

function hasErrors(errorMap) {
  return Object.values(errorMap).some(Boolean);
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
    return {
      ok: false,
      errors: {
        email: "",
        password: "Wrong password. Try again."
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
      console.warn("Session creation failed after registration", sessionError);
    }

    return { ok: true, user, errors: {} };
  } catch (error) {
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
  const session = await account.createOAuth2Session("google", successUrl, failureUrl);
  return session;
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
