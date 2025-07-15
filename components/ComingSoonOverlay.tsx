export function ComingSoonOverlay({
  title = 'Coming Soon!',
  description = "This feature is in development. Please explore what's visible and let us know your feedback.",
  feedbackLink = 'mailto:your@email.com?subject=MPB%20Feature%20Feedback',
}) {
  return (
    <>
      {/* Main blocker - covers everything except sidebar area */}
      <div className="fixed top-0 left-64 right-0 bottom-0 bg-black/10 pointer-events-auto z-50" />

      {/* Card - positioned in center of main content area */}
      <div className="fixed top-0 left-64 right-0 bottom-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="relative w-[400px] shadow-2xl border-2 border-solid border-[#d8cc97] bg-zinc-900/95 pointer-events-auto rounded-lg">
          <div className="py-10 px-8 text-center flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-[#d8cc97]">{title}</h2>
            <p className="text-zinc-300 text-base leading-relaxed">
              {description}
            </p>
            <a
              href={feedbackLink}
              className="mt-4 px-6 py-3 rounded-lg bg-[#d8cc97] text-black font-semibold hover:bg-[#c4b883] transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Send Feedback
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
