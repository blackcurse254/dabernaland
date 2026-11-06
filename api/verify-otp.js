import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { phone, code, exp, sig } = req.body || {};
  if (!phone || !code || !exp || !sig || Date.now() > Number(exp))
    return res.status(400).json({ ok: false, error: "کد منقضی شده" });

  const expected = crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${phone}.${exp}.${code}`)
    .digest("hex");

  const ok =
    expected.length === String(sig).length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig)));

  if (!ok) return res.status(400).json({ ok: false, error: "کد اشتباه است" });
  res.json({ ok: true });
}
