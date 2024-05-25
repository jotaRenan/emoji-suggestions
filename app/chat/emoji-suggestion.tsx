import { CompactEmoji } from "emojibase";
import compactEmojis from "emojibase-data/pt/compact.json";

export const EmojiSuggestion = ({
  onChange,
  searchTerm,
}: {
  searchTerm: string;
  onChange: (emoji: CompactEmoji) => void;
}) => {
  return (
    <div className="positioned-notice emoji-suggestion-box">
      {searchTerm.length > 2 &&
        compactEmojis
          .filter(
            (e) => e.tags?.some((tag) => tag.startsWith(searchTerm)) ?? false
          )
          .map((e) => (
            <button key={e.unicode} onClick={() => onChange(e)}>
              {e.unicode}
            </button>
          ))}
    </div>
  );
};
