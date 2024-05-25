import { useState, ElementRef, useRef } from "react";

import compactEmojis from "emojibase-data/pt/compact.json";
import { EmojiSuggestion } from "./emoji-suggestion";

const LIMIT_CHAR = ":";

/**
 * 1. prevent the suggestion box from closing. Allow multiple instances to be added
 * 2. improve UI
 * 3. ignore case of character when searching
 * 4. make it work with multiline pieces of text
 * 5. allow pressing tab to select emoji at any time while typing
 */

export const TextArea = () => {
  const [isOn, setIsOn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [text, setText] = useState("");

  const textAreaRef = useRef<ElementRef<"textarea">>(null);

  function reset() {
    setIsOn(false);
    setSearchTerm("");
  }

  function findEmoji(tag: string) {
    return compactEmojis.find((e) => e.tags?.includes(tag) ?? false)?.unicode;
  }

  function addEmoji(emoji: string) {
    replaceEmojiFind(emoji);
  }

  function replaceEmojiFind(unicode: string) {
    if (!textAreaRef.current) {
      throw new Error("aaa");
    }
    const final = textAreaRef.current.selectionStart - 1;

    let i = final;
    for (i; i > 0; i--) {
      if (text[i] === LIMIT_CHAR) {
        break;
      }
    }

    setText((curr) =>
      curr
        .slice(0, i)
        .concat(unicode)
        .concat(text.slice(final + 1))
        .concat(" ")
    );
  }

  return (
    <>
      <textarea
        ref={textAreaRef}
        className="anchor-text-input"
        value={text}
        rows={3}
        onChange={(e) => setText(e.currentTarget.value)}
        onInput={(e) => {
          const lastEntireWord = getLastEntireWord(e);
          if (!isOn) {
            return false;
          }

          if (lastEntireWord) {
            setSearchTerm(lastEntireWord.slice(1));
          } else {
            reset();
          }
        }}
        onKeyDown={(e) => {
          if (e.key !== LIMIT_CHAR) {
            if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
              return false;
            }
            return false;
          }
          const lastEntireWord = getLastEntireWord(e);
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

            reset();
            if (x.length > 0) {
              const match = findEmoji(x);
              if (match) {
                addEmoji(match);
                e.preventDefault();
              }
            }
            return false;
          }
        }}
      />
      <EmojiSuggestion
        searchTerm={searchTerm}
        onChange={(e) => {
          addEmoji(e.unicode);
          reset();
          textAreaRef.current?.focus();
        }}
      />
      <p>{text}</p>
      {JSON.stringify(isOn, null, 2)}
    </>
  );
};

function getLastEntireWord(
  e:
    | React.FormEvent<HTMLTextAreaElement>
    | React.KeyboardEvent<HTMLTextAreaElement>
) {
  const currentValue = e.currentTarget.value;

  const currentPosition = e.currentTarget.selectionStart;
  const lastEntireWord = currentValue
    .slice(0, currentPosition)
    .split(" ")
    .at(-1);
  return lastEntireWord;
}
