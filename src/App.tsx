export function App() {
  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* StatusBar placeholder */}
      <header className="flex h-12 items-center justify-between bg-white px-4 shadow-sm">
        <span className="text-lg">RoadTripper</span>
      </header>

      {/* Map placeholder */}
      <main className="flex flex-1 items-center justify-center bg-gray-200">
        <p className="text-gray-500">Map will be here</p>
      </main>

      {/* POI Cards placeholder */}
      <footer className="h-[180px] bg-gray-50 p-4 pb-safe">
        <p className="text-center text-gray-500">POI Cards will be here</p>
      </footer>
    </div>
  );
}

export default App;
