"use client";

import { Store, QrCode, PackageSearch, Sparkles } from "lucide-react";
import { SignPreview } from "../ui/SignPreview";
import { ValueItem } from "../ui/ValueItem";

export function Landing({ onStart }: { onStart: () => void }) {
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
