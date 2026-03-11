export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Site Information</h2>
          <p className="text-sm text-gray-500">Site name and URL are configured via environment variables.</p>
          <div className="mt-3 space-y-3">
            <div><span className="label">Site Name</span><p className="text-sm text-gray-700">{process.env.SITE_NAME || "Not set"}</p></div>
            <div><span className="label">Site URL</span><p className="text-sm text-gray-700">{process.env.SITE_URL || "Not set"}</p></div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">GitHub Integration</h2>
          <p className="text-sm text-gray-500">
            Auto-commit: <strong>{process.env.GITHUB_AUTO_COMMIT === "true" ? "Enabled" : "Disabled"}</strong>
            {" · "}Pull enabled: <strong>{process.env.GITHUB_PULL_ENABLED === "true" ? "Yes" : "No"}</strong>
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Backups</h2>
          <p className="text-sm text-gray-500">
            Automated backups: <strong>{process.env.BACKUP_ENABLED === "true" ? "Enabled" : "Disabled"}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
