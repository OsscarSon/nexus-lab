const paths: Record<string, string[]> = {
  home: ["M3 10 12 3l9 7", "M5 9v12h14V9", "M9 21v-7h6v7"],
  learn: ["M4 3h16v18H4z", "M8 7h8M8 11h8M8 15h5"],
  lab: ["M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3", "M8 14h8"],
  projects: ["M3 7h7l2 2h9v12H3z", "M3 7V4h7l2 3"],
  me: ["M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0", "M4 21v-2a8 8 0 0 1 16 0v2"],
  search: ["m21 21-5-5", "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0"],
  arrow: ["M4 12h16m-6-6 6 6-6 6"],
  compass: ["M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0", "m16 8-3 5-5 3 3-5z"],
  check: ["m5 12 4 4L19 6"],
  clock: ["M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0", "M12 6v6l4 2"],
  spark: ["m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"],
  programming: ["m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"],
  ai: [
    "M8 3v3M16 3v3M8 18v3M16 18v3M3 8h3M18 8h3M3 16h3M18 16h3",
    "M6 6h12v12H6z",
    "M9 10h6M9 14h4",
  ],
  games: [
    "M7 7h10a4 4 0 0 1 4 4v7a2 2 0 0 1-3 1l-3-3H9l-3 3a2 2 0 0 1-3-1v-7a4 4 0 0 1 4-4",
    "M6 11h6M9 8v6M16 11h.01M18 14h.01",
  ],
  engineering: [
    "M7 5h10v14H7z",
    "M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4",
    "M10 9h4v6h-4z",
  ],
  web: [
    "M3 4h18v16H3z",
    "M3 9h18M7 6h.01M10 6h.01",
    "m10 12-3 2 3 2m4-4 3 2-3 2",
  ],
  security: ["m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z", "m8 12 3 3 5-6"],
  robotics: [
    "M5 7h14v13H5z",
    "M12 3v4M3 11v6M21 11v6M8 11h.01M16 11h.01M8 16h8",
  ],
  future: ["m12 3 9 9-9 9-9-9z", "M12 7v10M7 12h10"],
  workspace: ["M3 3h18v18H3z", "M3 9h18M3 15h18M9 3v18M15 3v18"],
  opensource: [
    "M6 6h12M6 18h12",
    "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
    "M6 9v6a3 3 0 0 0 3 3h6",
  ],
  git: [
    "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
    "M6 9v6a3 3 0 0 0 3 3h6",
  ],
  logic: ["M4 5h7a7 7 0 0 1 0 14H4z", "M1 9h3M1 15h3M18 12h5"],
  python: ["m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"],
  spreadsheet: ["M3 3h18v18H3z", "M3 9h18M3 15h18M9 3v18M15 3v18"],
};
export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(paths[name] || paths.compass).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
