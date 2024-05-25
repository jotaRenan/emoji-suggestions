import { CompactEmoji } from "emojibase";

export const EmojiSuggestion = ({
  onChange,
  searchTerm,
}: {
  searchTerm: string;
  onChange: (emoji: CompactEmoji) => void;
}) => {
  return <div className="positioned-notice emoji-suggestion-box"></div>;
};
