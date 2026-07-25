// Envío del reporte por WhatsApp vía Meta Cloud API (WhatsApp Business).
// Requiere WA_TOKEN + WA_PHONE_ID y una plantilla aprobada (WA_TEMPLATE,
// por defecto "reporte_listo" con 2 variables: título y link).

export function whatsappConfigurado(): boolean {
  return !!(process.env.WA_TOKEN && process.env.WA_PHONE_ID);
}

export async function enviarReporteWhatsApp(
  telefono: string,
  titulo: string,
  url: string,
): Promise<boolean> {
  if (!whatsappConfigurado()) return false;
  const to = telefono.replace(/[^\d]/g, "");
  if (to.length < 8) return false;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WA_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: process.env.WA_TEMPLATE ?? "reporte_listo",
          language: { code: "es" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: titulo.slice(0, 200) },
                { type: "text", text: url },
              ],
            },
          ],
        },
      }),
    },
  );
  if (!res.ok) {
    console.error("Error enviando WhatsApp:", res.status, await res.text());
  }
  return res.ok;
}
