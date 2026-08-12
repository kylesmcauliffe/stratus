import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { BattleCard } from "@/lib/battle-card";
import { siteConfig } from "@/constants/theme";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function battleCardHtml(card: BattleCard): string {
  const metrics = card.metrics
    .map(
      (m) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#475569">${escapeHtml(m.label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600">${escapeHtml(m.value)}</td></tr>`,
    )
    .join("");
  const takeaways = card.takeaways
    .map(
      (t) =>
        `<li style="margin-bottom:8px"><strong>${escapeHtml(t.title)}</strong> — ${escapeHtml(t.body)}</li>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(card.name)}</title>
  <style>body{font-family:system-ui,sans-serif;padding:32px;color:#171717;max-width:720px;margin:0 auto}
  h1{font-size:24px;margin:0 0 4px} .sub{color:#475569;margin-bottom:20px}
  .badge{display:inline-block;background:#eef4ff;color:#1a469f;padding:4px 10px;border-radius:999px;font-size:12px;margin-right:6px}
  table{width:100%;border-collapse:collapse;margin:16px 0} .foot{font-size:11px;color:#94a3b8;margin-top:24px}</style></head>
  <body>
  <div style="color:#2b72e6;font-weight:700;margin-bottom:8px">Rainfall Stratus · Internal</div>
  <h1>${escapeHtml(card.name)}</h1>
  <p class="sub">${escapeHtml(card.headline)}</p>
  <p>${escapeHtml(card.pitch)}</p>
  <div>${card.flags.map((f) => `<span class="badge">${escapeHtml(f)}</span>`).join("")}</div>
  <table>${metrics}</table>
  <h2 style="font-size:16px;margin-top:24px">Takeaways</h2><ul>${takeaways}</ul>
  <p class="foot">${siteConfig.copyright} · ${siteConfig.website}</p>
  </body></html>`;
}

export async function exportBattleCard(card: BattleCard): Promise<void> {
  const html = battleCardHtml(card);

  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `${card.name} battle card`,
    });
  }
}
