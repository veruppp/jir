import { useState } from 'react';

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{embed:string, direct:string}|null>(null);

  const handleUpload = async (e: any) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    const form = new FormData();
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      setResult(res);
    };

    xhr.send(form);
  };

  return (
    <main className="max-w-xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">V-Cloud Uploader</h1>
      <form onSubmit={handleUpload}>
        <input type="file" name="file" required className="mb-4" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Upload</button>
        <div className="h-2 bg-blue-200 mt-4 rounded">
          <div className="h-2 bg-blue-500 rounded" style={{ width: progress + '%' }}></div>
        </div>
      </form>

      {result && (
        <div className="mt-4">
          <p>Embed link: <a href={result.embed} className="text-blue-600 underline" target="_blank">{result.embed}</a></p>
          <p>Direct link: <a href={result.direct} className="text-blue-600 underline" target="_blank">{result.direct}</a></p>
        </div>
      )}
    </main>
  );
}
