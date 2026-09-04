"use client";

import { useState, useMemo } from "react";
import { Landing } from "./screens/Landing";
import { RegisterStep } from "./screens/RegisterStep";
import { DetailsStep } from "./screens/DetailsStep";
import { SuccessScreen } from "./screens/SuccessScreen";
import { slugify } from "./utils";
import type { FormState, Screen } from "./types";

export default function StorefrontOnboarding() {
    const [screen, setScreen] = useState<Screen>("landing");
    const [copied, setCopied] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    const [form, setForm] = useState<FormState>({
        ownerName: "",
        email: "",
        password: "",
        shopName: "",
        category: "",
        description: "",
        contact: "",
        location: "",
        logoUrl: "",
    });

    const update =
        (key: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value }));

    const slug = useMemo(() => slugify(form.shopName), [form.shopName]);
    const shareLink = `catalogapp.lk/shop/${slug}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(
        "https://" + shareLink
    )}`;

    function validateStep1(): boolean {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.ownerName.trim()) e.ownerName = "Enter your name.";
        if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
        if (form.password.length < 6) e.password = "At least 6 characters.";
        if (!form.shopName.trim()) e.shopName = "Give your shop a name.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validateStep2(): boolean {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.category) e.category = "Pick a category.";
        if (!form.description.trim()) e.description = "Tell customers what you sell.";
        if (!form.contact.trim()) e.contact = "Add a way for customers to reach you.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function copyLink() {
        navigator.clipboard?.writeText("https://" + shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    }

    return (
        <div className="app-root">
            {screen === "landing" && <Landing onStart={() => setScreen("register")} />}

            {screen === "register" && (
                <RegisterStep
                    form={form}
                    errors={errors}
                    update={update}
                    onBack={() => setScreen("landing")}
                    onNext={() => validateStep1() && setScreen("details")}
                />
            )}

            {screen === "details" && (
                <DetailsStep
                    form={form}
                    errors={errors}
                    update={update}
                    onBack={() => setScreen("register")}
                    onNext={() => validateStep2() && setScreen("success")}
                />
            )}

            {screen === "success" && (
                <SuccessScreen
                    form={form}
                    shareLink={shareLink}
                    qrSrc={qrSrc}
                    copied={copied}
                    onCopy={copyLink}
                    onHome={() => setScreen("landing")}
                />
            )}
        </div>
    );
}
