"use client";

export function ValueItem({
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
