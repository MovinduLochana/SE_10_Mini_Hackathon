"use client";

import { useState, useMemo } from "react";
import { Landing } from "./screens/Landing";
import { RegisterStep } from "./screens/RegisterStep";
import { LoginStep } from "./screens/LoginStep";
import { DetailsStep } from "./screens/DetailsStep";
import { SuccessScreen } from "./screens/SuccessScreen";
import { slugify } from "./utils";
import type { FormState, Screen } from "./types";
import { api, StoreResponse } from "../../lib/api";

export default function StorefrontOnboarding() {
    const [screen, setScreen] = useState<Screen>("landing");
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [createdStore, setCreatedStore] = useState<StoreResponse | null>(null);
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

    const slug = useMemo(() => createdStore?.slug || slugify(form.shopName), [createdStore, form.shopName]);
    const shareLink = useMemo(() => {
        if (createdStore?.store_url) return createdStore.store_url;
        if (typeof window !== "undefined") return `${window.location.origin}/store/${slug}`;
        return `https://se-10-mini-hackathon.vercel.app/store/${slug}`;
    }, [createdStore, slug]);

    const qrSrc = createdStore?.qr_code_data_url || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(shareLink)}`;

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
        if (!form.contact.trim()) {
            e.contact = "Add a WhatsApp mobile number (e.g. 0771234567).";
        } else {
            const cleanPhone = form.contact.replace(/[\s\-]/g, "");
            const slPattern = /^(?:0|\+?94)?7[01245678]\d{7}$/;
            if (!slPattern.test(cleanPhone)) {
                e.contact = "Must be a valid Sri Lankan mobile number (e.g. 07X XXX XXXX).";
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleCreateShop() {
        if (!validateStep2()) return;
        setLoading(true);
        setApiError(null);

        try {
            // 1. Authenticate (Signup or Login)
            let token = "";
            try {
                const authRes = await api.signup(form.email, form.password);
                token = authRes.access_token;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.includes("already registered") || msg.includes("exists")) {
                    const loginRes = await api.login(form.email, form.password);
                    token = loginRes.access_token;
                } else {
                    throw err;
                }
            }

            if (typeof window !== "undefined") {
                localStorage.setItem("polalink_token", token);
            }

            // 2. Onboard Store via backend API
            const storeRes = await api.onboardStore(
                {
                    name: form.shopName,
                    whatsapp_number: form.contact,
                    description: form.description,
                    category: form.category,
                    location: form.location,
                    logo_url: form.logoUrl,
                    owner_name: form.ownerName,
                },
                token
            );

            if (typeof window !== "undefined") {
                localStorage.setItem("polalink_slug", storeRes.slug);
            }

            setCreatedStore(storeRes);
            setScreen("success");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to create shop. Please try again.";
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    }

    function copyLink() {
        navigator.clipboard?.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    }

    return (
        <div className="app-root">
            {screen === "landing" && <Landing onStart={() => setScreen("register")} onLogin={() => setScreen("login")} />}

            {screen === "login" && (
                <LoginStep
                    onBack={() => setScreen("landing")}
                    onSuccess={(store) => {
                        setCreatedStore(store);
                        setScreen("success");
                    }}
                    onNoStore={() => {
                        setScreen("register");
                    }}
                />
            )}

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
                    loading={loading}
                    apiError={apiError}
                    onBack={() => setScreen("register")}
                    onNext={handleCreateShop}
                />
            )}

            {screen === "success" && (
                <SuccessScreen
                    form={form}
                    slug={slug}
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
