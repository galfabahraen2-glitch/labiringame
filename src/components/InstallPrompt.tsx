import React, { useEffect, useState } from 'react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDeferredPrompt(null);
        setShowPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
      }
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      border: '2px solid #00e5ff',
      borderRadius: '12px',
      padding: '16px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
      maxWidth: '300px',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ color: '#fff', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
        <strong style={{ color: '#00e5ff', display: 'block', marginBottom: '4px' }}>Install LabyrinthQuest</strong>
        Install game ini di perangkatmu untuk akses lebih cepat dan pengalaman bermain fullscreen!
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setShowPrompt(false)}
          style={{
            background: 'transparent',
            border: '1px solid #ff4444',
            color: '#ff4444',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Nanti Saja
        </button>
        <button 
          onClick={handleInstallClick}
          style={{
            background: '#00e5ff',
            border: 'none',
            color: '#000',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(0,229,255,0.4)'
          }}
        >
          Install Sekarang
        </button>
      </div>
    </div>
  );
};
