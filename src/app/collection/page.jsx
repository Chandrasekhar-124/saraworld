'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useApp } from '../providers'

const CATEGORIES = [
  { id: 'studs', label: 'Studs' },
  { id: 'earrings', label: 'Ear Rings' },
  { id: 'hair-ornaments', label: 'Hair Ornaments' },
]

export default function CollectionPage() {
  const { settings } = useApp()
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      const result = {}
      for (const cat of CATEGORIES) {
        try {
          const q = query(
            collection(db, 'items'),
            where('category', '==', cat.id),
            orderBy('createdAt', 'desc')
          )
          const snap = await getDocs(q)
          result[cat.id] = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        } catch {
          result[cat.id] = []
        }
      }
      setItems(result)
      setLoading(false)
    }
    fetchItems()
  }, [])

  const wa = settings.whatsappNumber || '8500554096'

  return (
    <div className="collection">
      <header className="collection-header">
        <Link href="/" className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <img src="/logo.png" alt="SaraWorld" className="collection-logo" />
        <h2>Our Collection</h2>
      </header>

      <div className="categories">
        {CATEGORIES.map((cat) => {
          const isExpanded = expanded === cat.id
          const isCollapsed = expanded !== null && !isExpanded
          return (
            <div
              key={cat.id}
              className={`category${isExpanded ? ' expanded' : ''}${isCollapsed ? ' collapsed' : ''}`}
            >
              <button
                className="category-header"
                onClick={() => setExpanded(isExpanded ? null : cat.id)}
              >
                <h2>{cat.label}</h2>
                <span className="category-toggle">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              <div className="category-content">
                <div className="category-content-inner">
                  {loading ? (
                    <p className="placeholder">Loading...</p>
                  ) : (items[cat.id] || []).length === 0 ? (
                    <p className="placeholder">Coming soon</p>
                  ) : (
                    <div className="item-grid">
                      {(items[cat.id] || []).map((item) => (
                        <div key={item.id} className="item-card">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="item-img"
                            loading="lazy"
                          />
                          <h3>{item.name}</h3>
                          <a
                            href={`https://wa.me/91${wa}?text=${encodeURIComponent(
                              `Hi, I'm interested in "${item.name}" from ${cat.label}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp"
                          >
                            Contact on WhatsApp
                          </a>
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
    </div>
  )
}
