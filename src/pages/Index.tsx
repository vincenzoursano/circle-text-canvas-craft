
import BubbleChart from '@/components/BubbleChart';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white py-4 px-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Interactive D3 Bubble Chart</h1>
      </header>
      
      <main className="flex-1 p-4">
        <div className="mb-6 space-y-2">
          <p className="text-gray-600">
            This visualization demonstrates an interactive bubble chart created with D3.js. 
            The central bubble represents the main concept, with related topics radiating outward.
          </p>
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <h3 className="font-medium text-blue-700 mb-1">Interaction Guide:</h3>
            <ul className="list-disc pl-5 text-sm text-blue-600 space-y-1">
              <li><strong>Drag bubbles:</strong> Click and drag any bubble to reposition it</li>
              <li><strong>Zoom:</strong> Use mouse wheel or pinch gesture to zoom in/out</li>
              <li><strong>Pan:</strong> Click and drag the background to move around</li>
              <li><strong>Controls:</strong> Use the + and - buttons in the top right to zoom</li>
            </ul>
          </div>
        </div>
        
        <div className="w-full h-[80vh] border border-gray-200 rounded-lg shadow-md bg-white p-4">
          <BubbleChart />
        </div>
      </main>
      
      <footer className="bg-white py-4 px-6 text-center text-sm text-gray-500">
        <p>Created with D3.js v7 and React</p>
      </footer>
    </div>
  );
};

export default Index;
