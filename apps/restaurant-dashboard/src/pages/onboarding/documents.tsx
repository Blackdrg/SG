import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';

const DOCUMENTS = [
  { key: 'fssai', label: 'FSSAI License', required: true },
  { key: 'gstCertificate', label: 'GST Certificate', required: true },
  { key: 'businessLicense', label: 'Business License', required: true },
  { key: 'bankStatement', label: 'Bank Statement', required: false },
  { key: 'cancelledCheque', label: 'Cancelled Cheque', required: false },
] as const;

type DocKey = typeof DOCUMENTS[number]['key'];

export default function OnboardingDocuments() {
  const [docs, setDocs] = useState<Record<DocKey, { uploaded: boolean; verified: boolean; file?: File }>>({
    fssai: { uploaded: false, verified: false },
    gstCertificate: { uploaded: false, verified: false },
    businessLicense: { uploaded: false, verified: false },
    bankStatement: { uploaded: false, verified: false },
    cancelledCheque: { uploaded: false, verified: false },
  });
  const [loading, setLoading] = useState(false);

  const handleUpload = (key: DocKey, file: File | null) => {
    if (!file) return;
    setDocs({ ...docs, [key]: { uploaded: true, verified: false, file } });
  };

  const submit = async () => {
    setLoading(true);
    const payload = {
      step: 'DOCUMENT_UPLOAD',
      data: Object.fromEntries(DOCUMENTS.map(d => [d.key, docs[d.key].uploaded])),
    };
    try {
      const res = await fetch('/api/restaurant-onboarding/step/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) alert('Documents saved');
    } catch (e) {
      alert('Failed to save documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>Documents - Onboarding</title></Head>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Upload Documents</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Upload your business documents for verification.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {DOCUMENTS.map((doc) => (
            <div key={doc.key} style={{ background: '#171717', border: '1px solid #27272a', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{doc.label}</span>
                  {doc.required && <span style={{ color: '#f04e31', marginLeft: 6 }}>*</span>}
                </div>
                <span style={{
                  fontSize: 12,
                  color: docs[doc.key].verified ? '#4ade80' : docs[doc.key].uploaded ? '#facc15' : '#71717a',
                }}>
                  {docs[doc.key].verified ? '✓ Verified' : docs[doc.key].uploaded ? '⏳ Uploaded' : 'Pending'}
                </span>
              </div>
              <input
                type="file"
                id={`doc-${doc.key}`}
                aria-label={`Upload ${doc.label}`}
                onChange={(e) => handleUpload(doc.key, e.target.files?.[0] || null)}
                style={{ fontSize: 13 }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => window.location.href = '/onboarding/business'}
            style={{ ...buttonStyle.secondary, flex: 1 }}
          >
            Back
          </button>
          <Button
            label={loading ? 'Saving...' : 'Continue'}
            onClick={submit}
            disabled={loading}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  primary: {
    padding: '10px 20px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  secondary: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
};
