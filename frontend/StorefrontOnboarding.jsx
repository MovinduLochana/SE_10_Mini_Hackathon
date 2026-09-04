import React, { useState, useMemo } from "react";
import { Store, ArrowLeft, Sparkles, Copy, Check, ShoppingBag, PackageSearch, QrCode, MapPin, Phone } from "lucide-react";

const CATEGORIES = [
  "Grocery & food",
  "Fashion & apparel",
  "Electronics",
  "Handmade & crafts",
  "Hardware & tools",
  "Beauty & wellness",
  "Other",
];

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "your-shop";
}

function SignPreview({ shopName, category, ownerName, logoUrl, size = "md" }) {
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
          <img
            src={logoUrl}
            alt=""
            onError={(e) => (e.currentTarget.style.display = "none")}
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
            fontFamily: "'Anton', sans-serif",
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
            fontFamily: "'Work Sans', sans-serif",
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
              fontFamily: "'Work Sans', sans-serif",
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

function FieldLabel({ children }) {
  return (
    <label style={{ display: "block", fontSize: 14, color: "var(--ink)", marginBottom: 6, fontWeight: 500 }}>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "var(--paper)",
  fontFamily: "'Work Sans', sans-serif",
  fontSize: 15,
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
};

function TextField({ value, onChange, ...rest }) {
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

export default function StorefrontOnboarding() {
  const [screen, setScreen] = useState("landing"); // landing | register | details | success
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
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

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const slug = useMemo(() => slugify(form.shopName), [form.shopName]);
  const shareLink = `catalogapp.lk/shop/${slug}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(
    "https://" + shareLink
  )}`;

  function validateStep1() {
    const e = {};
    if (!form.ownerName.trim()) e.ownerName = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.password.length < 6) e.password = "At least 6 characters.";
    if (!form.shopName.trim()) e.shopName = "Give your shop a name.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500;600&display=swap');
        .app-root {
          --paper: #F3EFE2;
          --ink: #1C2B22;
          --marigold: #D9A62E;
          --teal: #2B6357;
          --line: #C9BFA0;
          --danger: #B0432D;
          background: var(--paper);
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(28,43,34,0.05),
            rgba(28,43,34,0.05) 1px,
            transparent 1px,
            transparent 30px
          );
          font-family: 'Work Sans', sans-serif;
          color: var(--ink);
          min-height: 100vh;
          width: 100%;
        }
        .sign-board {
          background: linear-gradient(160deg, #223B2C, #16261C);
          border-radius: 10px;
          box-shadow: 0 10px 22px rgba(17,26,20,0.28);
          border: 1px solid rgba(217,166,46,0.35);
        }
        .btn-primary {
          background: var(--teal);
          color: var(--paper);
          border: none;
          border-radius: 8px;
          padding: 13px 24px;
          font-family: 'Work Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.12s ease, background 0.15s ease;
        }
        .btn-primary:hover { background: #235148; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-ghost {
          background: transparent;
          color: var(--ink);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 13px 22px;
          font-family: 'Work Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
        }
        .btn-ghost:hover { border-color: var(--ink); }
        .field-error { color: var(--danger); font-size: 13px; margin-top: 5px; }
        .two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        @media (min-width: 860px) {
          .two-col { grid-template-columns: 1.1fr 0.9fr; align-items: start; }
        }
        .value-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media (min-width: 700px) {
          .value-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 44px;
          align-items: center;
        }
        @media (min-width: 860px) {
          .hero-grid { grid-template-columns: 1.05fr 0.95fr; }
        }
      `}</style>

      {screen === "landing" && (
        <Landing onStart={() => setScreen("register")} />
      )}

      {screen === "register" && (
        <OnboardingShell
          step={1}
          onBack={() => setScreen("landing")}
          backLabel="Back to home"
          form={form}
        >
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, margin: "0 0 6px", letterSpacing: "0.01em" }}>
            Register your shop
          </h1>
          <p style={{ color: "var(--ink)", opacity: 0.7, margin: "0 0 32px", fontSize: 15, maxWidth: 420 }}>
            This creates your owner account and starts your shop's sign.
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
              <TextField type="password" value={form.password} onChange={update("password")} placeholder="At least 6 characters" />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>
            <div>
              <FieldLabel>Shop name</FieldLabel>
              <TextField value={form.shopName} onChange={update("shopName")} placeholder="Nadeeka's Spice Corner" />
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

      {screen === "details" && (
        <OnboardingShell
          step={2}
          onBack={() => setScreen("register")}
          backLabel="Back"
          form={form}
        >
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, margin: "0 0 6px", letterSpacing: "0.01em" }}>
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
                  <option key={c} value={c}>{c}</option>
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
                style={{ ...inputStyle, resize: "vertical", fontFamily: "'Work Sans', sans-serif" }}
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
            <button className="btn-ghost" onClick={() => setScreen("register")}>Back</button>
            <button
              className="btn-primary"
              onClick={() => validateStep2() && setScreen("success")}
            >
              Create my shop
            </button>
          </div>
        </OnboardingShell>
      )}

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
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, margin: "0 0 10px" }}>
            {form.shopName || "Your shop"} is live
          </h1>
          <p style={{ opacity: 0.7, fontSize: 15, margin: "0 0 40px" }}>
            Share this link or QR code — customers don't need to log in to browse.
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
            <img src={qrSrc} alt="QR code linking to your storefront" width={140} height={140} style={{ borderRadius: 8 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <span>{shareLink}</span>
              <button
                onClick={copyLink}
                aria-label="Copy link"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", display: "flex" }}
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}
              </button>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button className="btn-primary" onClick={copyLink}>{copied ? "Link copied" : "Copy link"}</button>
              <button className="btn-ghost" onClick={() => setScreen("landing")}>Back to home</button>
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

function OnboardingShell({ step, onBack, backLabel, form, children }) {
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
          fontFamily: "'Work Sans', sans-serif",
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 8 }}>
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

function Landing({ onStart }) {
  return (
    <div>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Anton', sans-serif", fontSize: 19, letterSpacing: "0.01em" }}>
          <Store size={19} /> Stallfront
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <span style={{ fontSize: 14, opacity: 0.7, cursor: "pointer" }}>Log in</span>
          <button className="btn-primary" onClick={onStart} style={{ padding: "10px 18px", fontSize: 14 }}>
            Start your shop
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 24px 90px" }}>
        <div className="hero-grid">
          <div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 46, lineHeight: 1.06, margin: "0 0 20px", letterSpacing: "0.005em" }}>
              Your shop, live in minutes.
            </h1>
            <p style={{ fontSize: 17, opacity: 0.75, maxWidth: 440, margin: "0 0 30px", lineHeight: 1.6 }}>
              Fill in your products once. Get a catalog page customers can browse, search, and filter — shared with one link or a QR code, no app required.
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <button className="btn-primary" onClick={onStart}>Start your shop</button>
              <span style={{ fontSize: 13, opacity: 0.55 }}>Free to start · Takes about 3 minutes</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SignPreview shopName="Anura's Hardware" category="Hardware & tools" ownerName="Anura" />
          </div>
        </div>

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

function ValueItem({ icon, title, body }) {
  return (
    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
      <div style={{ color: "var(--teal)", marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.55, margin: 0 }}>{body}</p>
    </div>
  );
}
