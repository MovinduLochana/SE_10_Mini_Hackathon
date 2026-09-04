"use client";

import { useState, useMemo } from "react";
import {
    Store,
    ArrowLeft,
    Sparkles,
    Copy,
    Check,
    PackageSearch,
    QrCode,
} from "lucide-react";
import Image from "next/image";
import { api, StoreResponse } from "../lib/api";

// ── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
    "Grocery & food",
    "Fashion & apparel",
    "Electronics",
    "Handmade & crafts",
    "Hardware & tools",
    "Beauty & wellness",
    "Other",
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
    return (
        (str || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "your-shop"
    );
}

// ── Shared types ─────────────────────────────────────────────────────────────

interface FormState {
    ownerName: string;
    email: string;
    password: string;
    shopName: string;
    category: string;
    description: string;
    contact: string;
    location: string;
    logoUrl: string;
}

type Screen = "landing" | "register" | "details" | "success";

// ── Sub-components ───────────────────────────────────────────────────────────

interface SignPreviewProps {
    shopName: string;
    category: string;
    ownerName?: string;
    logoUrl?: string;
    size?: "sm" | "md";
}

function SignPreview({
    shopName,
    category,
    ownerName,
    logoUrl,
    size = "md",
}: SignPreviewProps) {
    const isSm = size === "sm";
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
                style={{
                    width: 2,
                    height: isSm ? 18 : 26,
                    background: "var(--ink)",
                    opacity: 0.55,
                }}
            />
            <div
                style={{
                    width: isSm ? 120 : 190,
                    height: 2,
                    background: "var(--ink)",
                    opacity: 0.55,
                    marginTop: -2,
                }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", width: isSm ? 120 : 190 }}>
                <div style={{ width: 2, height: isSm ? 14 : 20, background: "var(--ink)", opacity: 0.55 }} />
                <div style={{ width: 2, height: isSm ? 14 : 20, background: "var(--ink)", opacity: 0.55 }} />
            </div>
            <div
                className="sign-board"
                style={{
                    marginTop: -2,
                    width: isSm ? "auto" : 320,
                    minWidth: isSm ? 160 : undefined,
                    padding: isSm ? "16px 20px" : "30px 34px",
                    transform: "rotate(-0.6deg)",
                }}
            >
                {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={logoUrl}
                        alt=""
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                        style={{
                            width: isSm ? 34 : 48,
                            height: isSm ? 34 : 48,
                            objectFit: "cover",
                            borderRadius: 999,
                            border: "2px solid var(--paper)",
                            marginBottom: 10,
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: isSm ? 34 : 48,
                            height: isSm ? 34 : 48,
                            borderRadius: 999,
                            border: "2px dashed rgba(246,241,228,0.4)",
                            marginBottom: 10,
                        }}
                    />
                )}
                <div
                    style={{
                        fontFamily: "var(--font-anton), 'Anton', sans-serif",
                        fontSize: isSm ? 20 : 30,
                        lineHeight: 1.05,
                        color: "var(--paper)",
                        letterSpacing: "0.01em",
                        wordBreak: "break-word",
                    }}
                >
                    {shopName || "Your Shop Name"}
                </div>
                <div
                    style={{
                        marginTop: 8,
                        fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                        fontSize: isSm ? 11 : 13,
                        color: "var(--marigold)",
                        fontWeight: 500,
                    }}
                >
                    {category || "Your category"}
                </div>
                {ownerName && !isSm && (
                    <div
                        style={{
                            marginTop: 14,
                            paddingTop: 12,
                            borderTop: "1px solid rgba(246,241,228,0.18)",
                            fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                            fontSize: 12,
                            color: "rgba(246,241,228,0.65)",
                        }}
                    >
                        Run by {ownerName}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Input helpers ─────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
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

const inputStyle: React.CSSProperties = {
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

function TextField({
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

// ── Layout shells ─────────────────────────────────────────────────────────────

interface OnboardingShellProps {
    step: number;
    onBack: () => void;
    backLabel: string;
    form: FormState;
    children: React.ReactNode;
}

function OnboardingShell({
    step,
    onBack,
    backLabel,
    form,
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

// ── Value item ────────────────────────────────────────────────────────────────

function ValueItem({
    icon,
    title,
    body,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
}) {
    return (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
            <div style={{ color: "var(--teal)", marginBottom: 12 }}>{icon}</div>
            <h3
                style={{
                    fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    margin: "0 0 8px",
                }}
            >
                {title}
            </h3>
            <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.55, margin: 0 }}>{body}</p>
        </div>
    );
}

// ── Landing screen ────────────────────────────────────────────────────────────

function Landing({ onStart }: { onStart: () => void }) {
    return (
        <div>
            {/* Nav */}
            <div
                style={{
                    maxWidth: 1120,
                    margin: "0 auto",
                    padding: "26px 24px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: "var(--font-anton), 'Anton', sans-serif",
                        fontSize: 19,
                        letterSpacing: "0.01em",
                    }}
                >
                    <Store size={19} /> Stallfront
                </div>
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    <span style={{ fontSize: 14, opacity: 0.7, cursor: "pointer" }}>Log in</span>
                    <button
                        className="btn-primary"
                        onClick={onStart}
                        style={{ padding: "10px 18px", fontSize: 14 }}
                    >
                        Start your shop
                    </button>
                </div>
            </div>

            {/* Hero */}
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 24px 90px" }}>
                <div className="hero-grid">
                    <div>
                        <h1
                            style={{
                                fontFamily: "var(--font-anton), 'Anton', sans-serif",
                                fontSize: 46,
                                lineHeight: 1.06,
                                margin: "0 0 20px",
                                letterSpacing: "0.005em",
                            }}
                        >
                            Your shop, live in minutes.
                        </h1>
                        <p style={{ fontSize: 17, opacity: 0.75, maxWidth: 440, margin: "0 0 30px", lineHeight: 1.6 }}>
                            Fill in your products once. Get a catalog page customers can browse, search, and
                            filter — shared with one link or a QR code, no app required.
                        </p>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                            <button className="btn-primary" onClick={onStart}>
                                Start your shop
                            </button>
                            <span style={{ fontSize: 13, opacity: 0.55 }}>
                                Free to start · Takes about 3 minutes
                            </span>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <SignPreview
                            shopName="Anura's Hardware"
                            category="Hardware & tools"
                            ownerName="Anura"
                        />
                    </div>
                </div>

                {/* Value props */}
                <div style={{ marginTop: 100 }}>
                    <div className="value-grid">
                        <ValueItem
                            icon={<QrCode size={20} />}
                            title="One link, one QR"
                            body="Print it on a receipt or stick it on your counter. Anyone who scans it lands on your live catalog."
                        />
                        <ValueItem
                            icon={<PackageSearch size={20} />}
                            title="Update stock in seconds"
                            body="Mark something out of stock or adjust a price from your phone between customers."
                        />
                        <ValueItem
                            icon={<Sparkles size={20} />}
                            title="Descriptions, written for you"
                            body="Type a few keywords and get a ready-to-use product description you can edit before publishing."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Root component ────────────────────────────────────────────────────────────

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
        (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
        if (!form.contact.trim()) e.contact = "Add a way for customers to reach you.";
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
            {/* ── Landing ── */}
            {screen === "landing" && <Landing onStart={() => setScreen("register")} />}

            {/* ── Step 1: Register ── */}
            {screen === "register" && (
                <OnboardingShell
                    step={1}
                    onBack={() => setScreen("landing")}
                    backLabel="Back to home"
                    form={form}
                >
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
                        <button
                            className="btn-primary"
                            onClick={() => validateStep1() && setScreen("details")}
                        >
                            Continue to shop details
                        </button>
                    </div>
                </OnboardingShell>
            )}

            {/* ── Step 2: Details ── */}
            {screen === "details" && (
                <OnboardingShell
                    step={2}
                    onBack={() => setScreen("register")}
                    backLabel="Back"
                    form={form}
                >
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

                    {apiError && (
                        <div
                            style={{
                                padding: "12px 14px",
                                borderRadius: 8,
                                background: "#fee2e2",
                                color: "#991b1b",
                                fontSize: 14,
                                marginTop: 18,
                                border: "1px solid #f87171",
                            }}
                        >
                            {apiError}
                        </div>
                    )}

                    <div style={{ marginTop: 34, display: "flex", gap: 12 }}>
                        <button className="btn-ghost" onClick={() => setScreen("register")} disabled={loading}>
                            Back
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleCreateShop}
                            disabled={loading}
                        >
                            {loading ? "Creating your shop..." : "Create my shop"}
                        </button>
                    </div>
                </OnboardingShell>
            )}

            {/* ── Success ── */}
            {screen === "success" && (
                <div style={{ maxWidth: 620, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: 999,
                            background: "var(--teal)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 22px",
                        }}
                    >
                        <Check color="var(--paper)" size={26} />
                    </div>
                    <h1 style={{ fontFamily: "var(--font-anton), 'Anton', sans-serif", fontSize: 32, margin: "0 0 10px" }}>
                        {form.shopName || "Your shop"} is live
                    </h1>
                    <p style={{ opacity: 0.7, fontSize: 15, margin: "0 0 40px" }}>
                        Share this link or QR code — customers don&apos;t need to log in to browse.
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                        <SignPreview
                            shopName={form.shopName}
                            category={form.category}
                            ownerName={form.ownerName}
                            logoUrl={form.logoUrl}
                        />
                    </div>

                    <div
                        style={{
                            background: "rgba(255,255,255,0.4)",
                            border: "1px solid var(--line)",
                            borderRadius: 12,
                            padding: 28,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 18,
                        }}
                    >
                        <Image
                            src={qrSrc}
                            alt="QR code linking to your storefront"
                            width={160}
                            height={160}
                            style={{ borderRadius: 8, background: "#fff", padding: 4 }}
                            unoptimized
                        />
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                background: "var(--paper)",
                                border: "1px solid var(--line)",
                                borderRadius: 8,
                                padding: "10px 14px",
                                fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                                fontSize: 14,
                            }}
                        >
                            <span>{shareLink}</span>
                            <button
                                onClick={copyLink}
                                aria-label="Copy link"
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--teal)",
                                    display: "flex",
                                }}
                            >
                                {copied ? <Check size={17} /> : <Copy size={17} />}
                            </button>
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap", justifyContent: "center" }}>
                            <button className="btn-primary" onClick={copyLink}>
                                {copied ? "Link copied" : "Copy link"}
                            </button>
                            <a
                                href={`/store/${slug}`}
                                className="btn-primary"
                                style={{
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    background: "var(--ink)",
                                    color: "var(--paper)",
                                }}
                            >
                                Visit Store Catalog
                            </a>
                            <button className="btn-ghost" onClick={() => setScreen("landing")}>
                                Back to home
                            </button>
                        </div>
                    </div>

                    <p style={{ marginTop: 28, fontSize: 13, opacity: 0.55 }}>
                        Next: add your first products from the inventory manager.
                    </p>
                </div>
            )}
        </div>
    );
}
