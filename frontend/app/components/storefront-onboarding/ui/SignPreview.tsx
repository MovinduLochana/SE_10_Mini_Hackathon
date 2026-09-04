"use client";

interface SignPreviewProps {
    shopName: string;
    category: string;
    ownerName?: string;
    logoUrl?: string;
    size?: "sm" | "md";
}

export function SignPreview({
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
