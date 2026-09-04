/**
 * Decorative placeholder QR code. Swap for a real generated QR (e.g. from a
 * `qrcode` library or a backend-rendered image) once the storefront URL
 * scheme is finalized.
 */
export function StorefrontQrCode({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 140"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="QR code linking to the storefront"
    >
      <rect fill="none" height="35" rx="3" stroke="currentColor" strokeWidth="6" width="35" x="10" y="10" />
      <rect fill="currentColor" height="15" rx="2" width="15" x="20" y="20" />
      <rect fill="none" height="35" rx="3" stroke="currentColor" strokeWidth="6" width="35" x="95" y="10" />
      <rect fill="currentColor" height="15" rx="2" width="15" x="105" y="20" />
      <rect fill="none" height="35" rx="3" stroke="currentColor" strokeWidth="6" width="35" x="10" y="95" />
      <rect fill="currentColor" height="15" rx="2" width="15" x="20" y="105" />
      <rect fill="none" height="25" rx="2" stroke="currentColor" strokeWidth="5" width="25" x="90" y="90" />
      <rect fill="currentColor" height="9" width="9" x="98" y="98" />
      <circle cx="55" cy="20" r="3.5" />
      <circle cx="70" cy="20" r="3.5" />
      <circle cx="85" cy="20" r="3.5" />
      <circle cx="55" cy="35" r="3.5" />
      <circle cx="70" cy="35" r="3.5" />
      <circle cx="85" cy="35" r="3.5" />
      <circle cx="20" cy="55" r="3.5" />
      <circle cx="35" cy="55" r="3.5" />
      <circle cx="50" cy="55" r="3.5" />
      <circle cx="65" cy="55" r="3.5" />
      <circle cx="80" cy="55" r="3.5" />
      <circle cx="95" cy="55" r="3.5" />
      <circle cx="110" cy="55" r="3.5" />
      <circle cx="125" cy="55" r="3.5" />
      <circle cx="20" cy="70" r="3.5" />
      <circle cx="35" cy="70" r="3.5" />
      <circle cx="50" cy="70" r="3.5" />
      <circle cx="70" cy="70" fill="var(--color-primary)" r="4.5" />
      <circle cx="90" cy="70" r="3.5" />
      <circle cx="110" cy="70" r="3.5" />
      <circle cx="55" cy="85" r="3.5" />
      <circle cx="70" cy="85" r="3.5" />
      <circle cx="55" cy="100" r="3.5" />
      <circle cx="70" cy="100" r="3.5" />
      <circle cx="55" cy="115" r="3.5" />
      <circle cx="70" cy="115" r="3.5" />
      <circle cx="125" cy="95" r="3.5" />
      <circle cx="125" cy="110" r="3.5" />
      <circle cx="125" cy="125" r="3.5" />
    </svg>
  );
}
