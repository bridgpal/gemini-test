import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function UploadIcon() {
  return (
    <svg
      className="dropzone-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function HomeComponent() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processImage = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setStatusMessage('Uploading image...')

    const formData = new FormData()
    formData.append('image', file)

    try {
      setStatusMessage('Processing your image...')

      const response = await fetch('/.netlify/functions/restore', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.text || 'Processing failed')
      }

      // Store result in sessionStorage and navigate to result page
      const resultId = crypto.randomUUID()
      sessionStorage.setItem(`result-${resultId}`, JSON.stringify({
        imageUrl: data.imageUrl,
        text: data.text,
        model: data.model
      }))

      navigate({ to: '/result/$id', params: { id: resultId } })
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image'
      setError(errorMessage)
      setIsProcessing(false)
      setStatusMessage('')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0])
    }
  }

  return (
    <main>
      <h1>Magic Restorer</h1>
      <p className="tagline">Remaster your memories today</p>

      <div className="card">
        <div
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && document.getElementById('fileInput')?.click()}
          style={{ cursor: isProcessing ? 'wait' : 'pointer' }}
        >
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />
          {isProcessing ? (
            <div>
              <div className="spinner"></div>
              <p className="status-text">{statusMessage}</p>
              <p className="status-subtitle">This may take 15-30 seconds...</p>
            </div>
          ) : (
            <div>
              <UploadIcon />
              <p className="dropzone-title">Drop your photo here</p>
              <p className="dropzone-subtitle">or click to select a file</p>
            </div>
          )}
        </div>
        {error && (
          <div className="error-message">
            <p style={{ margin: 0 }}>{error}</p>
            <button
              onClick={() => setError(null)}
              className="secondary"
              style={{ marginTop: '1rem' }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
