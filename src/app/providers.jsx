'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const DEFAULT_SETTINGS = {
  whatsappNumber: '8500554096',
  instagram: 'saraworldd12',
  youtube: 'https://www.youtube.com/@saraworldd12',
  cataloguePdfUrl: 'https://drive.google.com/file/d/demo-catalogue',
}

const AppContext = createContext({ user: null, settings: DEFAULT_SETTINGS })

export function useApp() {
  return useContext(AppContext)
}

function SplashLogo() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="splash-logo" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5d5d8, #e8b4b8)',
        border: '3px solid #fff',
        boxShadow: '0 8px 32px rgba(232,180,184,0.35)',
      }}>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: 'italic', color: '#fff', fontSize: '1.5rem', lineHeight: 1.15, textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>Sara</span>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: 'italic', color: '#fff', fontSize: '1.5rem', lineHeight: 1.15, textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>World</span>
      </div>
    )
  }
  return <img src="/logo.png" alt="SaraWorld" className="splash-logo" onError={() => setErr(true)} />
}

function Splash({ onComplete }) {
  const [phase, setPhase] = useState('')

  useEffect(() => {
    const t0 = setTimeout(() => setPhase('logo'), 50)
    const t1 = setTimeout(() => setPhase('text'), 850)
    const t2 = setTimeout(() => setPhase('exit'), 2250)
    const t3 = setTimeout(onComplete, 2850)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div className={`splash ${phase}`}>
      <SplashLogo />
      <h1 className="splash-title">Welcome to SaraWorld</h1>
    </div>
  )
}

export default function Providers({ children }) {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('sara-splash-seen')) setShowSplash(true)
  }, [])

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, setUser, () => {})
  }, [])

  useEffect(() => {
    if (!db) return
    return onSnapshot(
      doc(db, 'settings', 'config'),
      (snap) => {
        if (snap.exists()) setSettings((s) => ({ ...s, ...snap.data() }))
      },
      () => {}
    )
  }, [])

  return (
    <AppContext.Provider value={{ user, settings }}>
      {showSplash && (
        <Splash
          onComplete={() => {
            sessionStorage.setItem('sara-splash-seen', '1')
            setShowSplash(false)
          }}
        />
      )}
      {children}
    </AppContext.Provider>
  )
}
