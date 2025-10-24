import { Link } from 'react-router'

export default function MaintenanceMode() {
  return (
    <main className={`
      container mx-auto flex min-h-screen flex-col items-center justify-center
      p-4
    `}
    >
      <img
        className="size-64"
        src="/logo.jpg"
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Under Maintenance</h1>
        <p className="mb-6 text-lg text-gray-600">
          We're currently performing scheduled maintenance to improve your experience.
        </p>
        <p className="text-sm text-gray-500">
          Please check back in a few minutes. Thank you for your patience!
        </p>
        <Link
          to="/"
          className={`
            text-sm
            hover:underline
          `}
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
