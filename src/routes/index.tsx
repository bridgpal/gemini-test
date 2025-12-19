import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      navigate({ to: '/processing/$id', params: { id: data.id } })
    } catch (err) {
      console.error(err)
      setError('Failed to upload image. Please try again.')
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
  }

  return (
    <main>
      <h1>Magic Restorer</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--color-dark-green)' }}>
        Bring your old family photos back to life with our AI restoration tool.
      </p>

      <div className="card">
        <div
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileSelect}
          />
          {isUploading ? (
            <div className="spinner"></div>
          ) : (
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                Drop your photo here
              </p>
              <p>or click to select a file</p>
            </div>
          )}
        </div>
        {error && <p style={{ color: 'var(--color-earth)', marginTop: '1rem' }}>{error}</p>}
      </div>
    </main>
  )
}