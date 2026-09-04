"use client";

import { useState } from "react";
import { OnboardingShell } from "../OnboardingShell";
import { FieldLabel, TextField } from "../ui/TextField";
import { api } from "../../../lib/api";

interface LoginStepProps {
    onBack: () => void;
    onSuccess: (store: any) => void;
    onNoStore: () => void;
}

export function LoginStep({ onBack, onSuccess, onNoStore }: LoginStepProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setError("");
        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);
        try {
            const loginRes = await api.login(email, password);
            const token = loginRes.access_token;
            
            // Check if user has a store
            const stores = await api.getMyStores(token);
            if (stores && stores.length > 0) {
                onSuccess(stores[0]);
            } else {
                onNoStore();
            }
        } catch (err: any) {
            setError(err.message || "Failed to log in.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <OnboardingShell step={1} onBack={onBack} backLabel="Back to home" form={{}}>
            <h1
                style={{
                    fontFamily: "var(--font-anton), 'Anton', sans-serif",
                    fontSize: 30,
                    margin: "0 0 6px",
                    letterSpacing: "0.01em",
                }}
            >
                Welcome back
            </h1>
            <p style={{ color: "var(--ink)", opacity: 0.7, margin: "0 0 32px", fontSize: 15, maxWidth: 420 }}>
                Log in to manage your shop.
            </p>

            <div style={{ display: "grid", gap: 20, maxWidth: 420 }}>
                <div>
                    <FieldLabel>Email</FieldLabel>
                    <TextField type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                    <FieldLabel>Password</FieldLabel>
                    <TextField
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                    />
                </div>
                {error && <div className="field-error">{error}</div>}
            </div>

            <div style={{ marginTop: 34, display: "flex", gap: 12 }}>
                <button className="btn-primary" onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </div>
        </OnboardingShell>
    );
}
