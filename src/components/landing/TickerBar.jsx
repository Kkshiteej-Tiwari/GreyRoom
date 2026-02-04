export default function TickerBar() {
  const keywords = [
    "Innovative",
    "Anonymous",
    "Secure",
    "Seamless",
    "Real-time",
    "Private",
    "Connected",
    "Ephemeral",
  ];

  // Duplicate keywords for seamless loop
  const allKeywords = [...keywords, ...keywords];

  return (
    <div className="py-4 sm:py-8 bg-surface overflow-hidden">
      <div className="relative flex">
        <div className="flex animate-marquee gap-4 sm:gap-8">
          {allKeywords.map((word, index) => (
            <div
              key={index}
              className="flex items-center gap-4 sm:gap-8 shrink-0"
            >
              <span className="text-lg sm:text-2xl font-semibold text-text-primary/20 whitespace-nowrap">
                {word}
              </span>
              <span className="text-text-primary/10">•</span>
            </div>
          ))}
        </div>
        <div className="flex animate-marquee gap-4 sm:gap-8" aria-hidden="true">
          {allKeywords.map((word, index) => (
            <div
              key={`dup-${index}`}
              className="flex items-center gap-4 sm:gap-8 shrink-0"
            >
              <span className="text-lg sm:text-2xl font-semibold text-text-primary/20 whitespace-nowrap">
                {word}
              </span>
              <span className="text-text-primary/10">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
