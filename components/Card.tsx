"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Card, CardType } from "@/lib/types";

// Per-type presentation. `reveal` (when present) describes the tap-to-reveal
// twist: the button label, the heading on the revealed box, and whether it is
// gated behind a 10s think-timer (riddles only).
type RevealCfg = { button: string; heading: string; timer?: boolean };

const TYPE_META: Record<
  CardType,
  { label: string; glyph: string; reveal?: RevealCfg }
> = {
  promise: {
    label: "A Diwali Promise 🤝",
    glyph: "🤝",
    reveal: { button: "Seal it 🤝", heading: "Sealed" },
  },
  riddle: {
    label: "Riddle Time 🧩",
    glyph: "🧩",
    reveal: { button: "Reveal answer 🔮", heading: "Answer", timer: true },
  },
  fortune: {
    label: "Your Diwali Fortune 🔮",
    glyph: "🔮",
    reveal: { button: "Reveal fortune 🔮", heading: "Fortune" },
  },
  task: { label: "Your Fun Task 🎯", glyph: "🎯" },
  dare: { label: "Playful Dare 🎭", glyph: "🎭" },
  appreciation: { label: "Diwali Appreciation 💛", glyph: "💛" },
  excuse: { label: "Diwali Excuse 😅", glyph: "😅" },
  "this-or-that": { label: "This or That ⚔️", glyph: "⚔️" },
};

export default function CardView({
  card,
  serial,
}: {
  card: Card;
  serial: number;
}) {
  const meta = TYPE_META[card.type];
  // A reveal is shown only when the type supports it AND there's content.
  const revealCfg = card.reveal ? meta.reveal : undefined;
  const timed = !!revealCfg?.timer;

  // Ref points at the card node. The download control lives inside it, so we
  // filter the control out of the exported PNG (see toPng filter below).
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Only timed reveals (riddles) lock the button for 10s so people think first.
  const [countdown, setCountdown] = useState(timed ? 10 : 0);

  // Tick the reveal lock down to zero (timed reveals only).
  useEffect(() => {
    if (!timed) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timed]);

  async function handleDownload() {
    const node = cardRef.current;
    if (!node) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2, // crisp export on high-DPI phones
        // Match the card's dark surface so transparent corners don't render white.
        backgroundColor: "#2a1020",
        // Exclude the in-card download button from the exported image.
        filter: (n) =>
          !(n instanceof HTMLElement && n.classList.contains("card__download")),
      });
      const link = document.createElement("a");
      link.download = `diwali-card-${serial}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      // Never crash the page if export fails (e.g. tainted canvas).
      console.error("Failed to export card as PNG:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="stage">
      {/* Captured node */}
      <div className="card" ref={cardRef}>
        <button
          type="button"
          className="card__download"
          onClick={handleDownload}
          disabled={downloading}
          aria-label={downloading ? "Saving…" : "Download card"}
          title="Download card"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M12 3v11m0 0l-4-4m4 4l4-4M5 20h14"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="card__inner">
          <div className="stamp">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/isource-logo.webp" alt="i-Source Infosystems" />
            <span className="stamp__tag">AICoE</span>
          </div>

          <p className="card__label">{meta.label}</p>

          <p className="card__text">{card.text}</p>

          <div className="divider" aria-hidden="true">
            <span />
            <b>{meta.glyph}</b>
            <span />
          </div>

          {/* Tap-to-reveal twist (riddle answer / promise cheer / fortune). */}
          {revealCfg && (
            <>
              {!revealed ? (
                <button
                  type="button"
                  className="reveal-btn"
                  onClick={() => setRevealed(true)}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Reveal in ${countdown}s` : revealCfg.button}
                </button>
              ) : (
                <div className="answer" role="status">
                  <small>{revealCfg.heading}</small>
                  {card.reveal}
                </div>
              )}
            </>
          )}

          <div className="card__footer">
            <span className="foot-main">AICoE · i-Source Infosystems</span>
          </div>
        </div>
      </div>
    </div>
  );
}
