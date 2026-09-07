'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useApp } from './providers'

const CATEGORIES = [
  { id: 'studs', label: 'Studs', desc: 'Elegant studs for every occasion' },
  { id: 'earrings', label: 'Ear Rings', desc: 'Statement pieces that speak volumes' },
  { id: 'hair-ornaments', label: 'Hair Ornaments', desc: 'Adorn your hair with grace' },
]

// ponytail: demo data when Firebase not connected, removed once real DB is set up
const DEMO_ITEMS = {
  studs: [
    { id: 'd1', name: 'Rose Gold Mini Studs', price: '₹499', description: 'Delicate rose gold plated studs with matte finish', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/stud1.jpg?alt=media' },
    { id: 'd2', name: 'Pearl Drop Studs', price: '₹599', description: 'Classic freshwater pearl on sterling silver base', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/stud2.jpg?alt=media' },
    { id: 'd3', name: 'Crystal Flower Studs', price: '₹349', description: 'Swarovski crystal petals with gold accent', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/stud3.jpg?alt=media' },
  ],
  earrings: [
    { id: 'd4', name: 'Jhumka Traditional', price: '₹899', description: 'Handcrafted brass jhumkas with antique finish', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/ear1.jpg?alt=media' },
    { id: 'd5', name: 'Silk Thread Chandbali', price: '₹749', description: 'Multicolor silk thread wrapped chandbali set', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/ear2.jpg?alt=media' },
    { id: 'd6', name: 'Kundan Drop Earrings', price: '₹1,299', description: 'Premium kundan stones with meenakari work', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/ear3.jpg?alt=media' },
  ],
  'hair-ornaments': [
    { id: 'd7', name: 'Bridal Hair Pin Set', price: '₹1,499', description: 'Set of 6 crystal-studded pins for bridal styling', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/hair1.jpg?alt=media' },
    { id: 'd8', name: 'Floral Hair Clip', price: '₹399', description: 'Handmade fabric flower clip with pearl center', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/hair2.jpg?alt=media' },
  ],
}

function Logo({ size = 150 }) {
  const [err, setErr] = useState(false)
  if (err) return (
    <div className="logo-fallback" style={{ width: size, height: size }}>
      <span>Sara</span><span>World</span>
    </div>
  )
  return <img src="/logo.png" alt="SaraWorld" className="logo-img" width={size} height={size} onError={() => setErr(true)} />
}

export default function Home() {
  const { settings } = useApp()
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(true)
  const collRef = useRef(null)

  useEffect(() => {
    async function load() {
      if (!db) { setItems(DEMO_ITEMS); setLoading(false); return }
      const result = {}
      for (const cat of CATEGORIES) {
        try {
          const q = query(collection(db, 'items'), where('category', '==', cat.id), orderBy('createdAt', 'desc'))
          const snap = await getDocs(q)
          result[cat.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        } catch { result[cat.id] = [] }
      }
      setItems(result)
      setLoading(false)
    }
    load()
  }, [])

  const wa = settings.whatsappNumber || '8500554096'
  const ig = (settings.instagram || 'saraworldd12').replace('@', '')
  const yt = settings.youtube || 'https://www.youtube.com/@saraworldd12'

  const scrollDown = () => collRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* HERO — logo first, full viewport */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-logo">
            <Logo size={170} />
          </div>
          <h1 className="hero-title">
            <span className="hw">Welcome</span>{' '}
            <span className="hw">to</span>{' '}
            <em className="hw accent">SaraWorld</em>
          </h1>
          <p className="hero-sub">Where Elegance meets Creativity</p>
          <div className="hero-divider" />
          <div className="hero-btns">
            <button className="btn-primary" onClick={scrollDown}>Explore Collection</button>
            {settings.cataloguePdfUrl && (
              <a href={settings.cataloguePdfUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">View Catalogue</a>
            )}
          </div>
        </div>
        <button className="scroll-hint" onClick={scrollDown} aria-label="Scroll down">
          <div className="mouse"><div className="wheel" /></div>
          <svg width="18" height="9" viewBox="0 0 18 9"><path d="M1 1l8 7 8-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </section>

      {/* COLLECTION */}
      <section className="collections" ref={collRef} id="collection">
        <div className="sec-head">
          <span className="sec-tag">Our Collection</span>
          <h2>Handcrafted With Love</h2>
          <div className="sec-rule" />
        </div>

        <div className="cat-list">
          {CATEGORIES.map(cat => {
            const open = expanded === cat.id
            return (
              <div key={cat.id} className={`cat-card${open ? ' open' : ''}`}>
                <button className="cat-head" onClick={() => setExpanded(open ? null : cat.id)}>
                  <div>
                    <h3>{cat.label}</h3>
                    <p>{cat.desc}</p>
                  </div>
                  <span className="cat-toggle">{open ? '−' : '+'}</span>
                </button>
                <div className="cat-body">
                  <div className="cat-body-inner">
                    {loading ? (
                      <p className="empty-msg">Loading...</p>
                    ) : (items[cat.id] || []).length === 0 ? (
                      <p className="empty-msg">Coming soon</p>
                    ) : (
                      <div className="item-grid">
                        {(items[cat.id] || []).map(item => (
                          <div key={item.id} className="item-card">
                            <div className="item-img">
                              <img src={item.imageUrl} alt={item.name} loading="lazy" />
                            </div>
                            <div className="item-info">
                              <h4>{item.name}</h4>
                              {item.price && <p className="item-price">{item.price}</p>}
                              {item.description && <p className="item-desc">{item.description}</p>}
                              <a href={`https://wa.me/91${wa}?text=${encodeURIComponent(`Hi, I'm interested in "${item.name}" from ${cat.label}`)}`} target="_blank" rel="noopener noreferrer" className="wa-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Enquire
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {settings.cataloguePdfUrl && (
          <div className="cat-cta">
            <a href={settings.cataloguePdfUrl} target="_blank" rel="noopener noreferrer" className="btn-catalogue">
              View Full Catalogue
            </a>
          </div>
        )}
      </section>

      {/* CONNECT — social blocks */}
      <section className="connect">
        <div className="sec-head light">
          <span className="sec-tag">Connect</span>
          <h2>Find Us Everywhere</h2>
          <div className="sec-rule" />
        </div>
        <div className="social-grid">
          <a href={`https://wa.me/91${wa}`} target="_blank" rel="noopener noreferrer" className="s-card">
            <div className="s-bar s-wa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>WhatsApp</span>
            </div>
            <div className="s-body"><p className="s-name">SaraWorld</p><p className="s-detail">+91 {wa}</p><span className="s-cta">Chat Now</span></div>
          </a>
          <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="s-card">
            <div className="s-bar s-ig">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <span>Instagram</span>
            </div>
            <div className="s-body"><p className="s-name">@{ig}</p><p className="s-detail">Follow for latest designs</p><span className="s-cta">View Profile</span></div>
          </a>
          <a href={yt} target="_blank" rel="noopener noreferrer" className="s-card">
            <div className="s-bar s-yt">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span>YouTube</span>
            </div>
            <div className="s-body"><p className="s-name">SaraWorld</p><p className="s-detail">Watch collection videos</p><span className="s-cta">Subscribe</span></div>
          </a>
        </div>
      </section>

      <footer className="foot">
        <span className="foot-brand">SaraWorld</span>
        <Link href="/admin" className="foot-link">Admin</Link>
      </footer>

      {/* Floating social icons — always visible, bottom-left */}
      <div className="float-socials">
        <a href={`https://wa.me/91${wa}`} target="_blank" rel="noopener noreferrer" className="float-wa" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href={`instagram://user?username=${ig}`} onClick={(e) => { setTimeout(() => { window.location.href = `https://instagram.com/${ig}`; }, 500); }} className="float-ig" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        </a>
        <a href={yt} target="_blank" rel="noopener noreferrer" className="float-yt" aria-label="YouTube">
          <svg viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
      </div>
    </>
  )
}
