const twilio = require('twilio');

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  try {
    return twilio(sid, token);
  } catch (e) {
    console.error('Error inicializando Twilio:', e.message);
    return null;
  }
}

function normalizeNumber(raw) {
  if (!raw) return null;
  const v = String(raw).trim();
  if (v.startsWith('whatsapp:')) return v;
  if (v.startsWith('+')) return `whatsapp:${v}`;
  const digits = v.replace(/\D/g, '');
  if (!digits) return null;
  // Por defecto Argentina (+54) si no se especifica código
  const prefixed = digits.startsWith('54') ? `+${digits}` : `+54${digits}`;
  return `whatsapp:${prefixed}`;
}

async function sendWhatsApp(to, body) {
  const client = getClient();
  const from = process.env.TWILIO_WHATSAPP_NUMBER; // p.ej. 'whatsapp:+14155238886'
  if (!client || !from) {
    console.log('[WHATSAPP MOCK] ->', { to, body });
    return { mock: true };
  }
  const toNormalized = normalizeNumber(to);
  if (!toNormalized) {
    console.warn('Número inválido para WhatsApp:', to);
    return { error: 'invalid_number' };
  }
  try {
    const msg = await client.messages.create({ from, to: toNormalized, body });
    return { sid: msg.sid };
  } catch (e) {
    console.error('Error enviando WhatsApp:', e.message);
    return { error: e.message };
  }
}

module.exports = { sendWhatsApp, normalizeNumber };