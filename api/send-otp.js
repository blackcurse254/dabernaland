import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { phone } = req.body || {};
  if (!/^09\d{9}$/.test(String(phone)))
    return res.status(400).json({ ok: false, error: "شماره نامعتبر است" });

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  const exp = Date.now() + 120000;
  const sig = crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${phone}.${exp}.${code}`)
    .digest("hex");

  const r = await fetch("https://portal.amootsms.com/rest/SendWithPattern", {
    method: "POST",
    headers: {
      Authorization: process.env.AMOOT_TOKEN,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      Mobile: phone,
      PatternCodeID: "1",
      PatternValues: code,
    }),
  });
  console.log(await r.text());

  res.json({ ok: r.ok, exp, sig });
}
