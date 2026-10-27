import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

export default function MembershipCard({ memberData }: { memberData: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Card.png`;
      link.click();
    } catch (err) {
      alert("Failed to render card image.");
    }
    setDownloading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-center transform scale-50 sm:scale-75 md:scale-100 origin-top">
        <div ref={cardRef} style={{ width: '900px', height: '625px', position: 'relative', backgroundImage: "url('/Front.jpg')", backgroundSize: '100% 100%', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ position: 'absolute', left: '29%', top: '24%', width: '45%', background: 'rgba(24,8,1,.94)', padding: '4px 12px' }}>
            <b style={{ fontSize: '12px', color: '#d89a76' }}>NAME:</b>
            <div style={{ fontSize: '27px', fontWeight: 'bold' }}>{memberData?.full_name || 'MEMBER NAME'}</div>
          </div>
        </div>
      </div>
      <button onClick={downloadCard} disabled={downloading} className="mt-8 bg-amber-600 text-white font-bold py-3 px-8 rounded shadow-lg">
        {downloading ? 'Rendering...' : 'Download Card PNG'}
      </button>
    </div>
  );
}
