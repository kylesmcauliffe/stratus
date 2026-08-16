import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="color-scheme" content="light" />
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root { height: 100%; background: #eef4ff; color-scheme: light; }
          body { margin: 0; font-family: system-ui, sans-serif; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
