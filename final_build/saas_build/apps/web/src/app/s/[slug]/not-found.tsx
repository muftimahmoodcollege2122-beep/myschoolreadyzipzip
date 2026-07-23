export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-12 bg-white rounded-2xl shadow-lg max-w-md">
        <p className="text-6xl mb-4">🏫</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">School Not Found</h1>
        <p className="text-gray-500 mb-6">This school doesn&apos;t exist on MySchool App.</p>
        <a href="/" className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500">← MySchool App</a>
      </div>
    </div>
  );
}
