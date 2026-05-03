export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
        <div className="text-5xl mb-4">&#8987;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing Link Expired</h1>
        <p className="text-gray-600">This signing link has expired. Contact the document sender for a new link.</p>
      </div>
    </div>
  )
}
