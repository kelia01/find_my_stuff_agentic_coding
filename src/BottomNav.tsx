export type View = "home" | "search" | "stickers" | "activity";

const TABS: { view: View; icon: string; label: string }[] = [
  { view: "home", icon: "🏠", label: "Home" },
  { view: "search", icon: "🔍", label: "Search" },
  { view: "stickers", icon: "🏷️", label: "Stickers" },
  { view: "activity", icon: "🕒", label: "Activity" },
];

export default function BottomNav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav className="nav glass no-print" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.view}
          className={"nav-btn" + (view === t.view ? " on" : "")}
          onClick={() => onChange(t.view)}
          aria-label={t.label}
          aria-current={view === t.view ? "page" : undefined}
        >
          <span aria-hidden>{t.icon}</span>
        </button>
      ))}
    </nav>
  );
}
