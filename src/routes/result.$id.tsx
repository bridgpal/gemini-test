import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/result/$id')({
  component: ResultComponent,
})

function ResultComponent() {
  const { id } = Route.useParams()

  return (
    <main>
      <h1>Your Restored Photo</h1>
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
           {/* In a real app we might show side-by-side. For now, just the result. 
               The 'serve' function returns the image stream.
               We use a timestamp to prevent caching if re-running.
           */}
          <img 
            src={`/netlify/functions/serve?id=${id}&type=result`} 
            alt="Restored" 
            className="result-image"
          />
          
          <div style={{ display: 'flex', gap: '1rem' }}>
             <a 
               href={`/netlify/functions/serve?id=${id}&type=result`} 
               download={`restored-${id}.jpg`}
             >
               <button>Download Photo</button>
             </a>
             <Link to="/">
               <button style={{ backgroundColor: 'var(--color-sage)', color: '#333' }}>
                 Restore Another
               </button>
             </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
