import type { MetaFunction, LinksFunction } from "@remix-run/node";
import { TextArea } from "~/chat/textarea";
import styles from "~/styles/shared.css?url";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.8",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        placeContent: "center",
        flexDirection: "column",
        padding: "0 300px",
        boxSizing: "border-box",
      }}
    >
      <h1>Você pode usar emojis no input abaixo 👇</h1>
      <div>
        <TextArea />
      </div>
    </div>
  );
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
