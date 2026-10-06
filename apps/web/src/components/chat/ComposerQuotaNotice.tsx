export function ComposerQuotaNotice({ onDismiss }: { readonly onDismiss: () => void }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs"
      style={{ marginTop: 8 }}
    >
      <span className="size-4 text-amber-500">!</span>
      <span className="composer-quota-notice-text">You are close to your provider quota.</span>
      <button
        className="ml-auto h-6 rounded-md px-2 text-xs hover:bg-amber-500/20"
        onClick={onDismiss}
        type="button"
      >
        Dismiss
      </button>
    </div>
  );
}
