import { account, ID } from "./appwrite.js";

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

function phoneToPseudoEmail(phone) {
  return `${normalizePhone(phone)}@dailywork.local`;
}

function validatePhone(phone) {
  const compact = normalizePhone(phone);
  if (!compact) {
    return "Please enter your phone number";
  }
  if (compact.length !== 10) {
    return "Phone number should be 10 digits";
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

function validateLoginForm({ phone, password }) {
  return {
    phone: validatePhone(phone),
    password: validatePassword(password)
  };
}

function validateRegisterForm(payload) {
  const errors = {
    role: payload.role ? "" : "Please choose who you are",
    name: validateName(payload.name),
    phone: validatePhone(payload.phone),
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

async function loginWithPhonePassword(phone, password) {
  const errors = validateLoginForm({ phone, password });
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  try {
    const email = phoneToPseudoEmail(phone);
    const session = await account.createEmailPasswordSession(email, password);
    return { ok: true, session, errors: {} };
  } catch (error) {
    return {
      ok: false,
      errors: {
        phone: "",
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
  const email = phoneToPseudoEmail(payload.phone);

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
        phone: duplicate ? "This phone number is already registered" : "Could not create account. Please try again."
      },
      error
    };
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
  normalizePhone,
  validateLoginForm,
  validateRegisterForm,
  hasErrors,
  loginWithPhonePassword,
  registerUser,
  getCurrentUser,
  logout
};
