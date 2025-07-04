import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { generateSlug } from '@/lib/slug';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  const embedDir = path.join(process.cwd(), 'pages/e');

  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(embedDir, { recursive: true });

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 * 1024 }); // 10GB

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const slug = generateSlug();
    const ext = path.extname(file.originalFilename || '');
    const newFilename = `${slug}${ext}`;
    const dest = path.join(uploadsDir, newFilename);

    fs.renameSync(file.filepath, dest);

    const embedContent = `export default function() {
  return (
    <div style={{textAlign:'center', padding:'20px'}}>
      ${
        ['.mp4', '.webm'].includes(ext) ? `<video controls width="100%" src="/uploads/${newFilename}"></video>` :
        ['.mp3', '.wav'].includes(ext) ? `<audio controls src="/uploads/${newFilename}"></audio>` :
        ['.jpg', '.jpeg', '.png', '.gif'].includes(ext) ? `<img src="/uploads/${newFilename}" style={{maxWidth:'100%'}} />` :
        `<a href="/uploads/${newFilename}" target="_blank">Download File</a>`
      }
    </div>
  )
}`;

    fs.writeFileSync(path.join(embedDir, `${slug}.tsx`), embedContent);

    res.status(200).json({
      embed: `/e/${slug}`,
      direct: `/uploads/${newFilename}`
    });
  });
}
