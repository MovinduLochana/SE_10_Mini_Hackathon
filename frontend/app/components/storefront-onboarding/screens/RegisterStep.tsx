"use client";

import { OnboardingShell } from "../OnboardingShell";
import { FieldLabel, TextField } from "../ui/TextField";
import type { FormState } from "../types";

interface RegisterStepProps {
    form: FormState;
    errors: Partial<Record<keyof FormState, string>>;
    update: (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBack: () => void;
    onNext: () => void;
}

export function RegisterStep({ form, errors, update, onBack, onNext }: RegisterStepProps) {
    return (
        <OnboardingShell step={1} onBack={onBack} backLabel="Back to home" form={form}>
            <h1
                style={{
                    fontFamily: "var(--font-anton), 'Anton', sans-serif",
                    fontSize: 30,
                    margin: "0 0 6px",
                    letterSpacing: "0.01em",
                }}
            >
                Register your shop
            </h1>
            <p style={{ color: "var(--ink)", opacity: 0.7, margin: "0 0 32px", fontSize: 15, maxWidth: 420 }}>
                This creates your owner account and starts your shop&apos;s sign.
            </p>

            <div style={{ display: "grid", gap: 20, maxWidth: 420 }}>
                <div>
                    <FieldLabel>Your name</FieldLabel>
                    <TextField value={form.ownerName} onChange={update("ownerName")} placeholder="Nadeeka Perera" />
                    {errors.ownerName && <div className="field-error">{errors.ownerName}</div>}
                </div>
                <div>
                    <FieldLabel>Email</FieldLabel>
                    <TextField type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                </div>
                <div>
                    <FieldLabel>Password</FieldLabel>
                    <TextField
                        type="password"
                        value={form.password}
                        onChange={update("password")}
                        placeholder="At least 6 characters"
                    />
                    {errors.password && <div className="field-error">{errors.password}</div>}
                </div>
                <div>
                    <FieldLabel>Shop name</FieldLabel>
                    <TextField
                        value={form.shopName}
                        onChange={update("shopName")}
                        placeholder="Nadeeka's Spice Corner"
                    />
                    {errors.shopName && <div className="field-error">{errors.shopName}</div>}
                </div>
            </div>

            <div style={{ marginTop: 34, display: "flex", gap: 12 }}>
                <button className="btn-primary" onClick={onNext}>
                    Continue to shop details
                </button>
            </div>
        </OnboardingShell>
    );
}
