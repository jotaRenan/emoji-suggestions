import { CompactEmoji } from "emojibase";
import compactEmojis from "emojibase-data/pt/compact.json";
import { ElementRef, useEffect, useRef, useState } from "react";

const initial: ReadonlyArray<CompactEmoji> = [];

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
  const isInactive = searchTerm.length <= 2;

  const searchTermRegexp = new RegExp(searchTerm, "i");
  const matches = compactEmojis.filter(
    (e) => e.tags?.some((tag) => searchTermRegexp.test(tag)) ?? false
  );

  useEffect(() => {
    const submitOnEnterAndTab = (e: KeyboardEvent) => {
      if (isInactive) {
        return;
      }

      if (e.key === "Enter" || e.key === "Tab") {
        form.current?.requestSubmit();
        e.preventDefault();
      }
    };
    textAreaRef?.addEventListener("keydown", submitOnEnterAndTab);

    return () =>
      textAreaRef?.removeEventListener("keydown", submitOnEnterAndTab);
  }, [textAreaRef, isInactive]);

  useEffect(() => {
    const navigateViaArrowKeys = (e: KeyboardEvent) => {
      if (isInactive) {
        return;
      }

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
    };
    textAreaRef?.addEventListener("keydown", navigateViaArrowKeys);

    return () =>
      textAreaRef?.removeEventListener("keydown", navigateViaArrowKeys);
  }, [lastSuccessfulMatch.length, textAreaRef, isInactive]);

  if (isInactive) {
    if (lastSuccessfulMatch !== initial) {
      setLastSuccessfulMatch(initial);
    }
    return null;
  }

  if (matches.length > 0 && lastSuccessfulMatch.length !== matches.length) {
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
        lastSuccessfulMatch.map((e, idx) => (
          <label style={{ display: "block" }} key={e.unicode}>
            <input
              checked={idx === selectedIndex}
              type="radio"
              name="selected-emoji"
              value={e.unicode}
              onChange={() => {
                setSelectedIndex(idx);
                form.current?.requestSubmit();
              }}
            />
            {e.unicode} - :{e.tags?.[0]}:
          </label>
        ))
      )}
    </form>
  );
};
