type IconName =
  | "home"
  | "live"
  | "liveDot"
  | "calendar"
  | "trophy"
  | "team"
  | "star"
  | "football"
  | "search";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export default function Icon({
  name,
  size = 20,
  className = "",
}: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );

    case "live":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "liveDot":
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="5"
            fill="currentColor"
            stroke="none"
          />

          <circle
            cx="12"
            cy="12"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="animate-live-pulse opacity-25"
          />

          <circle
            cx="12"
            cy="12"
            r="9.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="opacity-15"
          />
        </svg>
      );

    case "football":
      return (
        <svg {...common}>
          <path d="m12 3 3.5 2 1.3 4-2.8 3H10l-2.8-3 1.3-4L12 3Z" />
          <path d="M12 3v4" />
          <path d="m8.5 5 3.5 2 3.5-2" />
          <path d="m7.2 9-4.2 1.5 1.5 5 4.2 1.2" />
          <path d="m16.8 9 4.2 1.5-1.5 5-4.2 1.2" />
          <path d="m8.7 16.7 1.5 4h3.6l1.5-4" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M7.5 3v4M16.5 3v4M3.5 9h17" />
          <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" />
        </svg>
      );

    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
          <path d="M8 6H4v1a4 4 0 0 0 4 4" />
          <path d="M16 6h4v1a4 4 0 0 1-4 4" />
          <path d="M12 12v5" />
          <path d="M8 21h8M9 17h6" />
        </svg>
      );

    case "team":
      return (
        <svg {...common}>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4 21a8 8 0 0 1 16 0" />
          <path d="M19 5.5a3 3 0 0 1 0 5.8" />
          <path d="M21 19a6 6 0 0 0-3-5.2" />
        </svg>
      );

    case "star":
      return (
        <svg {...common}>
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );

    default:
      return null;
  }
}