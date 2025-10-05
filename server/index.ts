import express from 'express';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json({ limit: '10mb' }));

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

app.post('/api/render-cv', async (req, res) => {
  try {
    const { html, userId, layoutName } = req.body || {};
    if (!html) return res.status(400).json({ error: 'html required' });
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await browser.close();

    const filePath = `cvs/${userId}/${Date.now()}-${layoutName || 'classic'}.pdf`;
    const { error } = await supabase.storage.from('cv-pdfs').upload(filePath, pdf, {
      contentType: 'application/pdf',
      upsert: true,
    });
    if (error) throw error;

    const { data: signed, error: signErr } = await supabase.storage
      .from('cv-pdfs')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);
    if (signErr) throw signErr;

    return res.json({ url: signed?.signedUrl, path: filePath });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'render failed' });
  }
});

app.listen(process.env.PORT || 8787, () => console.log('PDF server running'));
