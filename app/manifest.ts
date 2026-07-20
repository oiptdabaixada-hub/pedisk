import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pedisk — Painel do Lojista",
    short_name: "Pedisk",
    description:
      "Receba pedidos e gerencie seu delivery pelo celular.",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050505",
    theme_color: "#f97316",
    lang: "pt-BR",
    categories: ["business", "food", "productivity"],
    icons: [
      {
        src: "/pedisk-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pedisk-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pedisk-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}