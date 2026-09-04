"use client";

import { ArrowLeft } from "lucide-react";
import { SignPreview } from "./ui/SignPreview";
import type { FormState } from "./types";

interface OnboardingShellProps {
    step: number;
    onBack: () => void;
    backLabel: string;
    form?: Partial<FormState>;
    children: React.ReactNode;
}

export function OnboardingShell({
    step,
    onBack,
    backLabel,
    form = {},
    children,
}: OnboardingShellProps) {
    return (
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px 80px" }}>
            <button
                onClick={onBack}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink)",
                    opacity: 0.65,
                    fontSize: 14,
                    fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                    padding: 0,
                    marginBottom: 22,
                }}
            >
                <ArrowLeft size={15} /> {backLabel}
            </button>

            <div style={{ display: "flex", gap: 6, marginBottom: 40, maxWidth: 200 }}>
                {[1, 2].map((s) => (
                    <div
                        key={s}
                        style={{
                            height: 4,
                            flex: 1,
                            borderRadius: 2,
                            background: s <= step ? "var(--teal)" : "var(--line)",
                        }}
                    />
                ))}
            </div>

            <div className="two-col">
                <div>{children}</div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                        paddingTop: 8,
                    }}
                >
                    <SignPreview
                        shopName={form.shopName}
                        category={form.category}
                        ownerName={form.ownerName}
                        logoUrl={form.logoUrl}
                    />
                    <p style={{ fontSize: 12.5, opacity: 0.55, textAlign: "center", maxWidth: 220 }}>
                        This is what customers will see when they open your shop.
                    </p>
                </div>
            </div>
        </div>
    );
}
