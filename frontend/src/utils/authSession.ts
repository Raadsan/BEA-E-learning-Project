export function saveAuthSession(token: string, user: { id: string | number; role: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("userId", String(user.id));
  localStorage.setItem("userRole", user.role);
}

export function redirectAfterLogin(role: string) {
  if (role === "admin" || role === "super" || role === "technical") {
    window.location.href = "/portal/admin";
  } else if (role === "teacher") {
    window.location.href = "/portal/teacher";
  } else if (role === "student") {
    window.location.href = "/portal/student";
  } else if (role === "proficiency_student") {
    window.location.href = "/portal/student/proficiency-test";
  } else {
    window.location.href = "/";
  }
}

type LoginResponse = {
  success?: boolean;
  requiresOtp?: boolean;
  otpSessionId?: string;
  token?: string;
  user?: { id: string | number; role: string };
};

/** After registration: log in directly (OTP step disabled). */
export function handlePostRegistrationLogin(
  result: LoginResponse,
  email: string,
  router: { push: (url: string) => void }
) {
  // OTP disabled
  // if (result.otpSessionId) {
  //   if (typeof window !== "undefined") {
  //     sessionStorage.setItem("bea_otp_session", result.otpSessionId);
  //     sessionStorage.setItem("bea_otp_email", email);
  //   }
  //   router.push(
  //     `/auth/verify-otp?email=${encodeURIComponent(email)}&otpSessionId=${encodeURIComponent(result.otpSessionId)}`
  //   );
  //   return;
  // }

  if (result.token && result.user) {
    saveAuthSession(result.token, result.user);
    redirectAfterLogin(result.user.role);
    return;
  }

  router.push(`/auth/login?email=${encodeURIComponent(email)}`);
}
