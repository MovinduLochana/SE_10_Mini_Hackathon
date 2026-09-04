"use client";

import { useState } from "react";

export const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 8,
    border: "1px solid var(--line)",
    background: "var(--paper)",
    fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
    fontSize: 15,
    color: "var(--ink)",
    outline: "none",
    boxSizing: "border-box",
};

export function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label
            style={{
                display: "block",
                fontSize: 14,
                color: "var(--ink)",
                marginBottom: 6,
                fontWeight: 500,
            }}
        >
            {children}
        </label>
    );
}

export function TextField({
    value,
    onChange,
    ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                ...inputStyle,
                borderColor: focused ? "var(--teal)" : "var(--line)",
                boxShadow: focused ? "0 0 0 3px rgba(43,99,87,0.12)" : "none",
            }}
            {...rest}
        />
    );
}
