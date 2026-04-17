"use client";

import { getPasswordPolicyChecks } from "@/lib/password-policy";

type PasswordRequirementsProps = {
  password: string;
};

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const checks = getPasswordPolicyChecks(password);

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid rgba(244, 244, 245, 0.08)",
        backgroundColor: "rgba(255, 255, 255, 0.02)"
      }}
    >
      <p style={{ margin: 0, color: "#a1a1aa", fontSize: 13, lineHeight: 1.5 }}>
        Password requirements
      </p>
      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          display: "grid",
          gap: 6,
          color: "#d4d4d8",
          fontSize: 13,
          lineHeight: 1.5
        }}
      >
        {checks.map((check) => (
          <li
            key={check.id}
            style={{
              color:
                password.length === 0
                  ? "#a1a1aa"
                  : check.isSatisfied
                    ? "#86efac"
                    : "#fca5a5"
            }}
          >
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
