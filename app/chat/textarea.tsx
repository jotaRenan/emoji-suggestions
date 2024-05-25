import { useState } from "react";

import { Emoji } from "emojibase";
import compactEmojis from "emojibase-data/pt/compact.json";

const LIMIT_CHAR = ":";
export const TextArea = () => {
  const [isOn, setIsOn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  function reset() {
    setIsOn(false);
    setSearchTerm("");
  }

  function addEmoji(tag: string) {
    const match = compactEmojis.find(
      (e) => e.tags?.includes(tag) ?? false
    )?.unicode;
    setEmojis((curr) => curr.concat([match ?? tag]));
  }

  const [emojis, setEmojis] = useState<string[]>([]);

  return (
    <>
      <textarea
        rows={3}
        onKeyDown={(e) => {
          if (e.key !== LIMIT_CHAR) {
            if (/[\n\r\s]+/.test(e.key) || e.key === "Enter") {
              setIsOn(false);
            }
            return false;
          }
          const currentValue = e.currentTarget.value;
          const currentPosition = e.currentTarget.selectionStart;

          const lastEntireWord = currentValue
            .slice(0, currentPosition)
            .split(" ")
            .at(-1);
          // ?.split(":")
          // .at(-1);

          console.log(lastEntireWord);

          if (lastEntireWord === undefined) {
            return false;
          }

          if (lastEntireWord.length === 0) {
            setIsOn(true);
            return false;
          }

          if (!isOn) {
            return false;
          }
          if (lastEntireWord[0] === LIMIT_CHAR) {
            const x = lastEntireWord.slice(
              lastEntireWord.split("").lastIndexOf(":") + 1
            );

            setIsOn(false);
            if (x.length > 0) {
              addEmoji(x);
            }
            return false;
          }
        }}
      ></textarea>
      {JSON.stringify(isOn, null, 2)}
      {JSON.stringify(emojis, null, 2)}
    </>
  );
};
