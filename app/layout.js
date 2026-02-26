import "./globals.css";

export const metadata = {
  title: "Calculadora IRPF Álava 2025 — Individual vs Conjunta",
  description:
    "Compara declaración individual y conjunta del IRPF de Álava (ejercicio 2025). NF 33/2013, NF 19/2024, NF 3/2025.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
