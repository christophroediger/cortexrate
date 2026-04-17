export type PasswordPolicyRule = {
  id: "length" | "lowercase" | "uppercase" | "number" | "special";
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_POLICY_MESSAGE =
  "Password must include uppercase, lowercase, number, and special character.";

export const PASSWORD_POLICY_RULES: PasswordPolicyRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password) => password.length >= 8
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter",
    test: (password) => /[a-z]/.test(password)
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    test: (password) => /[A-Z]/.test(password)
  },
  {
    id: "number",
    label: "At least one number",
    test: (password) => /\d/.test(password)
  },
  {
    id: "special",
    label: "At least one special character",
    test: (password) => /[^A-Za-z0-9]/.test(password)
  }
];

export function getPasswordPolicyChecks(password: string) {
  return PASSWORD_POLICY_RULES.map((rule) => ({
    ...rule,
    isSatisfied: rule.test(password)
  }));
}

export function isPasswordPolicySatisfied(password: string) {
  return PASSWORD_POLICY_RULES.every((rule) => rule.test(password));
}

export function isPasswordPolicyErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("password") &&
    (normalizedMessage.includes("uppercase") ||
      normalizedMessage.includes("lowercase") ||
      normalizedMessage.includes("special") ||
      normalizedMessage.includes("number") ||
      normalizedMessage.includes("digit"))
  );
}
