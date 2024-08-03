import { CompactEmoji } from "emojibase";
import compactEmojis from "emojibase-data/pt/compact.json";
import { ElementRef, useEffect, useMemo, useRef, useState } from "react";
import Fuse, { FuseResult, IFuseOptions } from "fuse.js";

export const EmojiSuggestion = ({
  onChange,
  searchTerm,
  textAreaRef,
}: {
  searchTerm: string;
  onChange: (emoji: string) => void;
  textAreaRef: ElementRef<"textarea"> | null;
}) => {
  const [lastSuccessfulMatch, setLastSuccessfulMatch] = useState(initial);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const form = useRef<ElementRef<"form">>(null);

  const matches = useMemo(
    () => fuse.search(searchTerm, { limit: 20 }),
    [searchTerm]
  );

  useEffect(() => {
    const controller = new AbortController();

    textAreaRef?.addEventListener(
      "keydown",
      function submitOnEnterAndTab(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === "Tab") {
          form.current?.requestSubmit();
          e.preventDefault();
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [textAreaRef]);

  useEffect(() => {
    const controller = new AbortController();

    textAreaRef?.addEventListener(
      "keydown",
      function navigateViaArrowKeys(e) {
        const scrollTo = (idx: number) => {
          const children = Array.from(form.current?.children ?? []);
          children.at(idx)?.scrollIntoView({ block: "nearest" });
        };

        if (e.key === "ArrowUp") {
          setSelectedIndex((curr) => {
            const res =
              (curr - 1 + lastSuccessfulMatch.length) %
              lastSuccessfulMatch.length;
            scrollTo(res);
            return res;
          });
          e.preventDefault();
        } else if (e.key === "ArrowDown") {
          setSelectedIndex((curr) => {
            const res = (curr + 1) % lastSuccessfulMatch.length;
            scrollTo(res);
            return res;
          });
          e.preventDefault();
        }
        return false;
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [lastSuccessfulMatch.length, textAreaRef]);

  if (matches.length > 0 && lastSuccessfulMatch !== matches) {
    setLastSuccessfulMatch(matches);
  }

  return (
    <form
      ref={form}
      className="positioned-notice emoji-suggestion-box"
      onSubmit={(e) => {
        onChange(e.currentTarget["selected-emoji"]?.value);
        e.preventDefault();
        return false;
      }}
    >
      {lastSuccessfulMatch.length === 0 ? (
        <span>None found</span>
      ) : (
        lastSuccessfulMatch.map(({ item, matches }, idx) => (
          <label style={{ display: "block" }} key={item.unicode}>
            <input
              checked={idx === selectedIndex}
              type="radio"
              name="selected-emoji"
              value={item.unicode}
              onChange={() => {
                setSelectedIndex(idx);
                form.current?.requestSubmit();
              }}
              onClick={() => {
                if (idx === selectedIndex) form.current?.requestSubmit();
              }}
            />
            <span
              style={{
                display: "inline-block",
                width: "1.5rem",
                aspectRatio: "1 / 1",
                textAlign: "center",
              }}
            >
              {item.unicode}
            </span>{" "}
            - :{matches?.[0].value ?? item.label}:
          </label>
        ))
      )}
    </form>
  );
};

const options = {
  includeScore: false,
  includeMatches: true,
  keys: ["label", "tags"],
  isCaseSensitive: false,
  minMatchCharLength: 2,
  threshold: 0.1,
} satisfies IFuseOptions<CompactEmoji>;

const fuse = new Fuse(compactEmojis, options);

const initial: FuseResult<CompactEmoji>[] = [];
