export const validatePassword = (password) => {
    // Requires at least one lowercase, one uppercase, one number, and one special character (any non-alphanumeric). Minimum 6 chars.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    return passwordRegex.test(password);
};

export const passwordPolicyMessage = "Password must be at least 6 characters and include uppercase, lowercase, number, and symbol";
