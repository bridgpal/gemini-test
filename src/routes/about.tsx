import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return (
    <main>
      <h1>How It Works</h1>
      <div className="divider"></div>

      <div className="card">
        <div className="content-block">
          <p>
            Welcome to <strong>Magic Restorer</strong>. Your old family photos are more than just images—they're irreplaceable windows into cherished moments and beloved faces.
          </p>
          <p>
            Our mission is to help you preserve these memories for generations to come. Using advanced AI technology, we carefully restore clarity, vibrancy, and life to your vintage photographs while maintaining the authentic character that makes them special.
          </p>
          <p>
            The process is simple: upload a photo, wait a moment while our AI works its magic, and download your beautifully restored memory.
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/">
            <button className="gold">Start Restoring</button>
          </Link>
        </div>
      </div>
    </main>
  )
}
