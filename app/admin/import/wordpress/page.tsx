export default function WordPressImportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Import from WordPress</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">WordPress XML Import</h2>
          <p className="text-sm text-gray-600 mb-4">
            Export your content from WordPress (Tools → Export → All Content), then upload the XML file here.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">Drag and drop your WordPress XML file here, or click to browse.</p>
            <input type="file" accept=".xml" className="mt-4" />
          </div>
          <p className="text-xs text-gray-400 mt-3">Maximum file size: 100MB. Supported format: WordPress WXR (XML).</p>
        </div>
      </div>
    </div>
  );
}
