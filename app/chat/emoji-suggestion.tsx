import { CompactEmoji } from "emojibase";
import compactEmojis from "emojibase-data/pt/compact.json";
import { useState } from "react";

const initial: ReadonlyArray<CompactEmoji> = [];

export const EmojiSuggestion = ({
  onChange,
  searchTerm,
}: {
  searchTerm: string;
  onChange: (emoji: CompactEmoji) => void;
}) => {
  const [lastSuccessfulMatch, setLastSuccessfulMatch] = useState(initial);

  if (searchTerm.length <= 2) {
    if (lastSuccessfulMatch !== initial) {
      setLastSuccessfulMatch(initial);
    }
    return null;
  }

  const matches = compactEmojis.filter(
    (e) => e.tags?.some((tag) => tag.startsWith(searchTerm)) ?? false
  );

  if (matches.length > 0 && lastSuccessfulMatch.length !== matches.length) {
    setLastSuccessfulMatch(matches);
  }

  return (
    <div className="positioned-notice emoji-suggestion-box">
      {lastSuccessfulMatch.length === 0 ? (
        <span>None found</span>
      ) : (
        lastSuccessfulMatch.map((e) => (
          <div key={e.unicode}>
            <button onClick={() => onChange(e)}>{e.unicode}</button>
          </div>
        ))
      )}
    </div>
  );
};
