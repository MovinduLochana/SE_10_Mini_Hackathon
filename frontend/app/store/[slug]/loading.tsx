export default function StorefrontLoading() {
    return (
        <div className="app-root" style={{ minHeight: "100vh", backgroundColor: "var(--paper, #fcfbf7)" }}>
            <div className="sf-page" style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 80px" }}>
                {/* Header Skeleton */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 14,
                            backgroundColor: "rgba(0,0,0,0.08)",
                        }}
                    />
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                width: "40%",
                                height: 26,
                                borderRadius: 6,
                                backgroundColor: "rgba(0,0,0,0.08)",
                                marginBottom: 8,
                            }}
                        />
                        <div
                            style={{
                                width: "65%",
                                height: 14,
                                borderRadius: 4,
                                backgroundColor: "rgba(0,0,0,0.04)",
                            }}
                        />
                    </div>
                </div>

                {/* Controls Bar Skeleton */}
                <div
                    style={{
                        height: 52,
                        borderRadius: 10,
                        backgroundColor: "rgba(0,0,0,0.04)",
                        marginBottom: 24,
                    }}
                />

                {/* Sort / Count Row Skeleton */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ width: 80, height: 16, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.05)" }} />
                    <div style={{ width: 140, height: 28, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.05)" }} />
                </div>

                {/* Product Grid Skeleton */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 16,
                    }}
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            style={{
                                borderRadius: 12,
                                border: "1px solid var(--line, #e7e5e4)",
                                backgroundColor: "var(--paper, #fcfbf7)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: 160,
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                }}
                            />
                            <div style={{ padding: 14 }}>
                                <div
                                    style={{
                                        width: "70%",
                                        height: 16,
                                        borderRadius: 4,
                                        backgroundColor: "rgba(0,0,0,0.08)",
                                        marginBottom: 8,
                                    }}
                                />
                                <div
                                    style={{
                                        width: "40%",
                                        height: 14,
                                        borderRadius: 4,
                                        backgroundColor: "rgba(0,0,0,0.05)",
                                        marginBottom: 12,
                                    }}
                                />
                                <div
                                    style={{
                                        height: 34,
                                        borderRadius: 8,
                                        backgroundColor: "rgba(0,0,0,0.04)",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
