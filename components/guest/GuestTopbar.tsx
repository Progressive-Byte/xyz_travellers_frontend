"use client";

type GuestTopbarProps = {
  title: string;
  onMenuToggle: () => void;
  quickAction?: React.ReactNode;
};

export const GuestTopbar: React.FC<GuestTopbarProps> = ({
  title,
  onMenuToggle,
  quickAction,
}) => {
  return (
    <div className="border-b border-border-light bg-[rgba(245,243,237,0.88)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="surface-card-strong flex h-10 w-10 items-center justify-center rounded-[16px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
            aria-label="Open guest navigation"
          >
            <svg
              className="h-5 w-5 text-text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="truncate font-sora text-[18px] font-bold tracking-[-0.04em] text-text-primary">
              {title}
            </p>
          </div>
        </div>

        {quickAction ? <div className="shrink-0">{quickAction}</div> : null}
      </div>
    </div>
  );
};
