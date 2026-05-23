export default function AlreadySignedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
        <div className="text-5xl mb-4 text-green-500">&#10003;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Signed</h1>
        <p className="text-gray-600">You have already signed this document. Thank you!</p>
      </div>
    </div>
  )
}
