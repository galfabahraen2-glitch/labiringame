import React, { useState } from 'react';
import { useGameStore, type AvatarConfig, type CameraView, type JoystickMode } from '../store';
import { audio } from '../audioManager';

const SKIN_COLORS = ['#f5cba7','#d4a574','#c68642','#8d5524','#fde3a7','#4e2c0e'];
const SHIRT_COLORS = ['#2980b9','#27ae60','#e74c3c','#8e44ad','#f39c12','#1abc9c','#2c3e50','#e67e22'];
const PANTS_COLORS = ['#2c3e50','#1a252f','#6c3483','#1a5276','#4a235a','#7b241c','#1e8449','#935116'];
const ACCESSORIES: AvatarConfig['accessory'][] = ['none','hat','crown','turban','bandana'];
const ACC_LABELS: Record<string, string> = { none:'Tidak Ada', hat:'Topi', crown:'Mahkota', turban:'Sorban', bandana:'Bandana' };

const T = {
  id: {
    settings: 'Pengaturan',
    playerName: 'Nama Pemain',
    avatar: 'Kostum Avatar',
    skin: 'Warna Kulit',
    shirt: 'Warna Baju',
    pants: 'Warna Celana',
    accessory: 'Aksesoris',
    audio: 'Pengaturan Audio',
    music: 'Volume Musik',
    sfx: 'Volume Efek Suara',
    language: 'Bahasa',
    save: 'Simpan & Kembali',
    namePlaceholder: 'Masukkan nama Anda...',
    cameraOptions: 'Sudut Pandang Kamera',
    camIso: 'Isometric (Atas Miring)',
    camThird: 'Third-Person (Dari Belakang)',
    camFirst: 'First-Person (Dari Mata)',
    joystickOptions: 'Sistem Kontrol',
    joySingle: '1 Joystick (Tengah, Multifungsi)',
    joyDual: '2 Joystick (Kiri: Gerak, Kanan: Arah)',
    fullscreen: 'Layar Penuh (Otomatis Landscape)',
  },
  en: {
    settings: 'Settings',
    playerName: 'Player Name',
    avatar: 'Avatar Costume',
    skin: 'Skin Color',
    shirt: 'Shirt Color',
    pants: 'Pants Color',
    accessory: 'Accessory',
    audio: 'Audio Settings',
    music: 'Music Volume',
    sfx: 'SFX Volume',
    language: 'Language',
    save: 'Save & Back',
    namePlaceholder: 'Enter your name...',
    cameraOptions: 'Camera View',
    camIso: 'Isometric (Top-Down)',
    camThird: 'Third-Person (Behind)',
    camFirst: 'First-Person (Eyes)',
    joystickOptions: 'Controls',
    joySingle: '1 Joystick (Center, Multi-function)',
    joyDual: '2 Joysticks (Left: Move, Right: Look)',
    fullscreen: 'Force Fullscreen (Landscape)',
  }
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1rem',
    border: '1px solid rgba(255,255,255,0.08)',
  }}>
    <h3 style={{ color: '#00e5ff', marginBottom: '1rem', fontSize: '0.95rem', letterSpacing: '1px' }}>
      {title}
    </h3>
    {children}
  </div>
);

const ColorRow: React.FC<{ colors: string[]; selected: string; onSelect: (c: string) => void }> = ({ colors, selected, onSelect }) => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {colors.map(c => (
      <button
        key={c}
        onClick={() => { audio.buttonClick(); onSelect(c); }}
        style={{
          width: '36px', height: '36px',
          borderRadius: '50%',
          background: c,
          border: selected === c ? '3px solid #00e5ff' : '2px solid rgba(255,255,255,0.2)',
          cursor: 'pointer',
          boxShadow: selected === c ? '0 0 10px #00e5ff' : 'none',
          transition: 'all 0.15s',
        }}
      />
    ))}
  </div>
);

export const SettingsScreen: React.FC = () => {
  const { playerName, avatarConfig, language, musicVolume, sfxVolume, cameraView, joystickMode,
    setPlayerName, setAvatarConfig, setLanguage, setMusicVolume, setSfxVolume, setCameraView, setJoystickMode,
    setGameState } = useGameStore();

  const [nameInput, setNameInput] = useState(playerName);
  const t = T[language];

  const handleFullscreen = () => {
    audio.buttonClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      // Try to lock orientation if supported
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch (e) {}
    } else {
      document.exitFullscreen().catch(() => {});
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (e) {}
    }
  };


  const handleSave = () => {
    audio.buttonClick();
    setPlayerName(nameInput.trim() || 'Pejalan');
    audio.setMusicVolume(musicVolume);
    audio.setSfxVolume(sfxVolume);
    setGameState('menu');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0a0a14, #0d1a2e)',
      overflowY: 'auto',
      fontFamily: 'Inter, sans-serif',
      zIndex: 20,
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ color: '#00e5ff', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>
          ⚙️ {t.settings}
        </h1>

        {/* Player Name */}
        <Section title={`👤 ${t.playerName}`}>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            maxLength={20}
            placeholder={t.namePlaceholder}
            style={{
              width: '100%', padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(0,229,255,0.4)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff', fontSize: '1rem',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </Section>

        {/* Avatar */}
        <Section title={`🎭 ${t.avatar}`}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>{t.skin}</label>
            <ColorRow colors={SKIN_COLORS} selected={avatarConfig.skinColor} onSelect={c => setAvatarConfig({ skinColor: c })} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>{t.shirt}</label>
            <ColorRow colors={SHIRT_COLORS} selected={avatarConfig.shirtColor} onSelect={c => setAvatarConfig({ shirtColor: c })} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>{t.pants}</label>
            <ColorRow colors={PANTS_COLORS} selected={avatarConfig.pantsColor} onSelect={c => setAvatarConfig({ pantsColor: c })} />
          </div>
          <div>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>{t.accessory}</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ACCESSORIES.map(acc => (
                <button
                  key={acc}
                  onClick={() => { audio.buttonClick(); setAvatarConfig({ accessory: acc }); }}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    border: avatarConfig.accessory === acc ? '2px solid #00e5ff' : '1px solid rgba(255,255,255,0.2)',
                    background: avatarConfig.accessory === acc ? 'rgba(0,229,255,0.15)' : 'transparent',
                    color: avatarConfig.accessory === acc ? '#00e5ff' : '#aaa',
                    cursor: 'pointer', fontSize: '0.8rem',
                  }}
                >
                  {ACC_LABELS[acc]}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Gameplay & Controls */}
        <Section title={`🎮 ${t.cameraOptions} & Kontrol`}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.6rem' }}>{t.cameraOptions}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(['isometric', 'third-person', 'first-person'] as CameraView[]).map(view => (
                <button
                  key={view}
                  onClick={() => { audio.buttonClick(); setCameraView(view); }}
                  style={{
                    padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'left',
                    border: cameraView === view ? '2px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)',
                    background: cameraView === view ? 'rgba(0,229,255,0.1)' : 'rgba(0,0,0,0.4)',
                    color: cameraView === view ? '#00e5ff' : '#aaa', cursor: 'pointer',
                  }}
                >
                  {view === 'isometric' ? `🎥 ${t.camIso}` : view === 'third-person' ? `🧍‍♂️ ${t.camThird}` : `👁️ ${t.camFirst}`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.6rem' }}>{t.joystickOptions}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(['single', 'dual'] as JoystickMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => { audio.buttonClick(); setJoystickMode(mode); }}
                  style={{
                    padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'left',
                    border: joystickMode === mode ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.1)',
                    background: joystickMode === mode ? 'rgba(46,204,113,0.1)' : 'rgba(0,0,0,0.4)',
                    color: joystickMode === mode ? '#2ecc71' : '#aaa', cursor: 'pointer',
                  }}
                >
                  {mode === 'single' ? `🕹️ ${t.joySingle}` : `🕹️🕹️ ${t.joyDual}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleFullscreen}
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '8px',
                border: '1px solid #f39c12', background: 'rgba(243,156,18,0.1)',
                color: '#f39c12', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              📱 {t.fullscreen}
            </button>
          </div>
        </Section>

        {/* Audio */}
        <Section title={`🔊 ${t.audio}`}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.music}</span><span style={{ color: '#00e5ff' }}>{Math.round(musicVolume * 100)}%</span>
            </label>
            <input type="range" min={0} max={1} step={0.01} value={musicVolume}
              onChange={e => setMusicVolume(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#00e5ff', marginTop: '0.5rem' }} />
          </div>
          <div>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.sfx}</span><span style={{ color: '#00e5ff' }}>{Math.round(sfxVolume * 100)}%</span>
            </label>
            <input type="range" min={0} max={1} step={0.01} value={sfxVolume}
              onChange={e => setSfxVolume(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#00e5ff', marginTop: '0.5rem' }} />
          </div>
        </Section>

        {/* Language */}
        <Section title={`🌏 ${t.language}`}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {(['id', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => { audio.buttonClick(); setLanguage(lang); }}
                style={{
                  padding: '0.6rem 1.5rem', borderRadius: '20px',
                  border: language === lang ? '2px solid #00e5ff' : '1px solid rgba(255,255,255,0.2)',
                  background: language === lang ? 'rgba(0,229,255,0.15)' : 'transparent',
                  color: language === lang ? '#00e5ff' : '#aaa',
                  cursor: 'pointer', fontSize: '1rem',
                }}
              >
                {lang === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </Section>

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '1rem',
            borderRadius: '30px',
            background: 'linear-gradient(45deg, #00b4d8, #0077b6)',
            border: 'none', color: '#fff',
            fontSize: '1.1rem', fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ✅ {t.save}
        </button>
      </div>
    </div>
  );
};

// Track Record Screen
export const TrackRecordScreen: React.FC = () => {
  const { trackRecord, setGameState, language } = useGameStore();
  const isId = language === 'id';

  const sorted = [...trackRecord].reverse();

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0a0a14, #0d1a2e)',
      overflowY: 'auto',
      fontFamily: 'Inter, sans-serif',
      zIndex: 20,
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ color: '#f1c40f', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
          📜 {isId ? 'Rekam Jejak Perjalanan' : 'Journey Track Record'}
        </h1>
        <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {isId ? 'Setiap langkah tercatat dalam kitab perjalanan hidupmu.' : 'Every step is recorded in the book of your life\'s journey.'}
        </p>

        {sorted.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', padding: '3rem 0' }}>
            {isId ? 'Belum ada catatan perjalanan.' : 'No journey records yet.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sorted.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: r.survived ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                border: `1px solid ${r.survived ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`,
              }}>
                <span style={{ fontSize: '1.5rem' }}>{r.survived ? '✅' : '💀'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {isId ? 'Level' : 'Level'} {r.level}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{r.date}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  <div style={{ color: '#00e5ff', fontSize: '0.9rem' }}>💎 {r.treasures}</div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
                    ⏱ {Math.floor(r.timeUsed / 60)}m {r.timeUsed % 60}s
                  </div>
                  <button
                    onClick={() => {
                      audio.buttonClick();
                      useGameStore.getState().setLevel(r.level);
                      useGameStore.getState().revivePlayer();
                      useGameStore.getState().setGameState('playing');
                    }}
                    style={{
                      marginTop: '0.25rem', padding: '0.3rem 0.6rem',
                      background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)',
                      borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer',
                    }}
                  >
                    ▶ {isId ? 'Mainkan' : 'Play'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => { audio.buttonClick(); setGameState('menu'); }}
          style={{
            marginTop: '2rem', width: '100%', padding: '0.85rem',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: '#aaa', cursor: 'pointer', fontSize: '1rem',
          }}
        >
          ← {isId ? 'Kembali' : 'Back'}
        </button>
      </div>
    </div>
  );
};
