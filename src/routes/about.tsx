import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return (
    <main>
      <h1>About VintageRestorer</h1>
      <div className="card" style={{ textAlign: 'left', lineHeight: '1.8' }}>
        <p>
          Welcome to <strong>VintageRestorer</strong>. We understand that your old family photos are more than just paper—they are precious memories.
        </p>
        <p>
          Our goal is to help you preserve these moments for future generations. We use advanced technology to gently restore clarity, color, and life to your vintage photographs, all while keeping the original character of your loved ones intact.
        </p>
        <p>
          It's simple: upload a photo, wait a moment, and download your restored memory.
        </p>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/">
            <button>Back to Home</button>
          </Link>
        </div>
      </div>
    </main>
  )
}