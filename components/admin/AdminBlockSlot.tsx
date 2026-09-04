export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Admin Paneli</h1>
      
      {/* Saat Kapatma Arayüzü */}
      <AdminBlockSlot />

      {/* Randevu Listesi vb. */}
    </div>
  );
}