export default function BackupsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Backups</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-600 mb-4">
          Automated backups run daily at 2:00 AM. You can also create a manual backup.
        </p>
        <button className="btn-primary">Create Backup Now</button>
      </div>
    </div>
  );
}
