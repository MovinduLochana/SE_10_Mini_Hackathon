"use client";

import { OnboardingShell } from "../OnboardingShell";
import { FieldLabel, TextField, inputStyle } from "../ui/TextField";
import { CATEGORIES } from "../types";
import type { FormState } from "../types";

interface DetailsStepProps {
    form: FormState;
    errors: Partial<Record<keyof FormState, string>>;
    update: (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBack: () => void;
    onNext: () => void;
}

export function DetailsStep({ form, errors, update, onBack, onNext }: DetailsStepProps) {
    return (
        <OnboardingShell step={2} onBack={onBack} backLabel="Back" form={form}>
            <h1
                style={{
                    fontFamily: "var(--font-anton), 'Anton', sans-serif",
                    fontSize: 30,
                    margin: "0 0 6px",
                    letterSpacing: "0.01em",
                }}
            >
                Tell customers about your shop
            </h1>
            <p style={{ color: "var(--ink)", opacity: 0.7, margin: "0 0 32px", fontSize: 15, maxWidth: 420 }}>
                This is what shows on your public catalog page.
            </p>

            <div style={{ display: "grid", gap: 20, maxWidth: 420 }}>
                <div>
                    <FieldLabel>Category</FieldLabel>
                    <select
                        value={form.category}
                        onChange={update("category")}
                        style={{ ...inputStyle, appearance: "auto" }}
                    >
                        <option value="">Choose a category</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    {errors.category && <div className="field-error">{errors.category}</div>}
                </div>
                <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                        value={form.description}
                        onChange={update("description")}
                        placeholder="Fresh-ground spices and pantry staples, made in small batches."
                        rows={4}
                        style={{
                            ...inputStyle,
                            resize: "vertical",
                            fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                        }}
                    />
                    {errors.description && <div className="field-error">{errors.description}</div>}
                </div>
                <div>
                    <FieldLabel>Contact number or WhatsApp</FieldLabel>
                    <TextField value={form.contact} onChange={update("contact")} placeholder="+94 77 123 4567" />
                    {errors.contact && <div className="field-error">{errors.contact}</div>}
                </div>
                <div>
                    <FieldLabel>Area (optional)</FieldLabel>
                    <TextField value={form.location} onChange={update("location")} placeholder="Negombo" />
                </div>
                <div>
                    <FieldLabel>Logo or banner photo URL (optional)</FieldLabel>
                    <TextField value={form.logoUrl} onChange={update("logoUrl")} placeholder="https://..." />
                </div>
            </div>

            <div style={{ marginTop: 34, display: "flex", gap: 12 }}>
                <button className="btn-ghost" onClick={onBack}>
                    Back
                </button>
                <button className="btn-primary" onClick={onNext}>
                    Create my shop
                </button>
            </div>
        </OnboardingShell>
    );
}
