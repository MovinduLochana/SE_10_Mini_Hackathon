"use client";

import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { SignPreview } from "../ui/SignPreview";
import type { FormState } from "../types";

interface SuccessScreenProps {
    form: FormState;
    shareLink: string;
    qrSrc: string;
    slug?: string;
    copied: boolean;
    onCopy: () => void;
    onHome: () => void;
}

export function SuccessScreen({ form, shareLink, qrSrc, slug, copied, onCopy, onHome }: SuccessScreenProps) {
    return (
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
                    width={140}
                    height={140}
                    style={{ borderRadius: 8 }}
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
                        onClick={onCopy}
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
                    <button className="btn-primary" onClick={onCopy}>
                        {copied ? "Link copied" : "Copy link"}
                    </button>
                    {slug && (
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
                    )}
                    <a
                        href="/dashboard"
                        className="btn-primary"
                        style={{
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            background: "var(--teal)",
                            color: "var(--paper)",
                        }}
                    >
                        Manage Inventory & Products →
                    </a>
                    <button className="btn-ghost" onClick={onHome}>
                        Back to home
                    </button>
                </div>
            </div>

            <p style={{ marginTop: 28, fontSize: 13, opacity: 0.55 }}>
                Next: add your first products from the inventory manager.
            </p>
        </div>
    );
}
