'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { auth, db, storage } from '../../lib/firebase'
import { useApp } from '../providers'

const CATEGORIES = [
  { id: 'studs', label: 'Studs' },
  { id: 'earrings', label: 'Ear Rings' },
  { id: 'hair-ornaments', label: 'Hair Ornaments' },
]

// ponytail: demo mode flag, true when Firebase not configured
const DEMO = !auth

export default function AdminPage() {
  const { user, settings } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [demoUser, setDemoUser] = useState(false)
  const [selectedCat, setSelectedCat] = useState('studs')
  const [items, setItems] = useState([])
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemFile, setItemFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber || '8500554096')
  const [instagram, setInstagram] = useState(settings.instagram || 'saraworldd12')
  const [youtube, setYoutube] = useState(settings.youtube || '')
  const [catalogueLink, setCatalogueLink] = useState(settings.cataloguePdfUrl || '')
  const [saved, setSaved] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'items'),
        where('category', '==', selectedCat),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      setItems([])
    }
  }, [selectedCat])

  useEffect(() => {
    if (user) fetchItems()
  }, [user, fetchItems])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    if (DEMO) {
      if (email === 'admin@saraworld.com' && password === 'admin123') {
        setDemoUser(true)
      } else {
        setError('Demo login: admin@saraworld.com / admin123')
      }
      return
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Invalid credentials')
    }
  }

  async function handleAddItem(e) {
    e.preventDefault()
    if (!itemName.trim() || !itemFile) return
    setUploading(true)
    setError('')
    if (DEMO) {
      const url = URL.createObjectURL(itemFile)
      setItems(prev => [{ id: `demo-${Date.now()}`, name: itemName.trim(), price: itemPrice.trim(), description: itemDesc.trim(), imageUrl: url }, ...prev])
      setItemName(''); setItemPrice(''); setItemDesc('')
      setItemFile(null)
      setUploading(false)
      return
    }
    try {
      const path = `items/${Date.now()}_${itemFile.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, itemFile)
      const imageUrl = await getDownloadURL(storageRef)
      await addDoc(collection(db, 'items'), {
        name: itemName.trim(),
        price: itemPrice.trim(),
        description: itemDesc.trim(),
        category: selectedCat,
        imageUrl,
        storagePath: path,
        createdAt: serverTimestamp(),
      })
      setItemName(''); setItemPrice(''); setItemDesc('')
      setItemFile(null)
      fetchItems()
    } catch (err) {
      setError('Upload failed: ' + err.message)
    }
    setUploading(false)
  }

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"?`)) return
    if (DEMO) {
      setItems(prev => prev.filter(i => i.id !== item.id))
      return
    }
    try {
      if (item.storagePath) await deleteObject(ref(storage, item.storagePath))
      await deleteDoc(doc(db, 'items', item.id))
      fetchItems()
    } catch (err) {
      setError('Delete failed: ' + err.message)
    }
  }

  async function handleSaveSettings() {
    if (DEMO) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }
    try {
      await setDoc(
        doc(db, 'settings', 'config'),
        {
          whatsappNumber: whatsapp,
          instagram: instagram,
          youtube: youtube,
          cataloguePdfUrl: catalogueLink,
        },
        { merge: true }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setError('')
    } catch (err) {
      setError('Save failed: ' + err.message)
    }
  }

  if (!user && !demoUser) {
    return (
      <div className="admin">
        <Link href="/" className="back-btn">
          Back
        </Link>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <Link href="/" className="back-btn">
          Back
        </Link>
        <h2>Admin Panel</h2>
        <button className="btn btn-secondary" onClick={() => DEMO ? setDemoUser(false) : signOut(auth)}>
          Logout
        </button>
      </header>

      {DEMO && <p className="error" style={{ background: '#fff3cd', color: '#856404', borderColor: '#ffc107' }}>Demo Mode — Firebase not connected. Changes are local only.</p>}
      {error && <p className="error">{error}</p>}

      <div className="admin-section">
        <h3>Manage Items</h3>
        <div className="cat-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`cat-tab${selectedCat === cat.id ? ' active' : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddItem} className="add-item-form">
          <input
            type="text"
            placeholder="Item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Price (e.g. ₹499)"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
          />
          <input
            type="text"
            placeholder="Short description"
            value={itemDesc}
            onChange={(e) => setItemDesc(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setItemFile(e.target.files?.[0] || null)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add Item'}
          </button>
        </form>

        <div className="admin-grid">
          {items.map((item) => (
            <div key={item.id} className="admin-item">
              <img src={item.imageUrl} alt={item.name} />
              <p>{item.name}</p>
              {item.price && <p className="item-price">{item.price}</p>}
              {item.description && <p className="item-desc">{item.description}</p>}
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(item)}
              >
                Delete
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="placeholder">No items in this category</p>
          )}
        </div>
      </div>

      <div className="admin-section">
        <h3>Settings</h3>
        <label className="field-label">WhatsApp Number</label>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="8500554096"
        />
        <label className="field-label">Instagram Username</label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="saraworldd12"
        />
        <label className="field-label">YouTube Link</label>
        <input
          type="text"
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          placeholder="https://www.youtube.com/@saraworldd12"
        />
        <label className="field-label">Catalogue Link (Google Drive)</label>
        <input
          type="text"
          value={catalogueLink}
          onChange={(e) => setCatalogueLink(e.target.value)}
          placeholder="https://drive.google.com/..."
        />
        <button className="btn btn-primary" onClick={handleSaveSettings} style={{ marginTop: '1rem' }}>
          {saved ? 'Saved!' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
