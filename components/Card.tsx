"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Card, CardType } from "@/lib/types";

// Per-type presentation: the label line + the divider glyph. (No separate type
// badge — the label already names the type.)
const TYPE_META: Record<CardType, { label: string; glyph: string }> = {
  wish: { label: "A Diwali Wish ✨", glyph: "🪔" },
  task: { label: "Your Fun Task 🎯", glyph: "🎯" },
  riddle: { label: "Riddle Time 🧩", glyph: "🧩" },
  dare: { label: "Playful Dare 🎭", glyph: "🎭" },
};

export default function CardView({
  card,
  serial,
}: {
  card: Card;
  serial: number;
}) {
  // Ref points at the card node. The download control lives inside it, so we
  // filter the control out of the exported PNG (see toPng filter below).
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Riddles lock the answer for 10s so people actually think first.
  const [countdown, setCountdown] = useState(card.type === "riddle" ? 10 : 0);

  const meta = TYPE_META[card.type];

  // Tick the reveal lock down to zero (riddles only).
  useEffect(() => {
    if (card.type !== "riddle") return;
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
  }, [card.type]);

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

          {/* Only riddles ever surface an answer. */}
          {card.type === "riddle" && card.answer && (
            <>
              {!revealed ? (
                <button
                  type="button"
                  className="reveal-btn"
                  onClick={() => setRevealed(true)}
                  disabled={countdown > 0}
                >
                  {countdown > 0
                    ? `Reveal in ${countdown}s`
                    : "Reveal answer 🔮"}
                </button>
              ) : (
                <div className="answer" role="status">
                  <small>Answer</small>
                  {card.answer}
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
