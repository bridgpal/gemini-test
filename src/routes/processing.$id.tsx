import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/processing/$id')({
  component: ProcessingComponent,
})

function ProcessingComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('initializing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let failures = 0;
    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/netlify/functions/status?id=${id}`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)
          if (data.status === 'completed') {
            clearInterval(intervalId)
            navigate({ to: '/result/$id', params: { id } })
          }
        } else {
          failures++;
        }
      } catch (error) {
        console.error('Polling error:', error)
        failures++;
      }

      if (failures > 5) {
        clearInterval(intervalId)
        setError("We're having trouble checking the status. Please refresh the page.")
      }
    }

    intervalId = setInterval(pollStatus, 2000)
    pollStatus() // check immediately

    return () => clearInterval(intervalId)
  }, [id, navigate])

  if (error) {
    return (
      <main>
        <h1>Something went wrong</h1>
        <div className="card">
          <p style={{ color: 'var(--color-earth)', fontSize: '1.2rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Restoring Photo...</h1>
      <div className="card">
        <div className="spinner"></div>
        <p style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
          Please wait while our AI magic works on your photo.
        </p>
        <p style={{ color: '#666' }}>This usually takes a few seconds.</p>
      </div>
    </main>
  )
}
