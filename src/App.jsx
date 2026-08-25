import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SupplyGraph from './SupplyGraph'; // Adjust path if your graph component is named differently

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], relationships: [] });
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [impactedNodes, setImpactedNodes] = useState([]);

  useEffect(() => {
    // Fetch initial graph
    axios.get('http://localhost:5001/api/graph')
      .then((response) => {
        setGraphData(response.data);
        const suppliers = response.data.nodes.filter(n => n.label === 'Supplier');
        if (suppliers.length > 0) {
          setSelectedSupplier(suppliers[0].id);
        }
      })
      .catch((err) => console.error('Error fetching graph:', err));
  }, []);

  const handleSimulate = async () => {
    if (!selectedSupplier) return;
    try {
      const response = await axios.get(`http://localhost:5001/api/blast-radius/${selectedSupplier}`);
      console.log('Backend response:', response.data);
      setImpactedNodes(response.data.impactedNodeIds || []);
    } catch (error) {
      console.error('Error running blast radius simulation:', error);
    }
  };

  const suppliers = graphData.nodes.filter(n => n.label === 'Supplier');

  return (
    <div style={{ padding: '20px', background: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <h1>Supply Chain Blast-Radius Analyzer</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <select 
          value={selectedSupplier} 
          onChange={(e) => setSelectedSupplier(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.label})</option>
          ))}
        </select>
        
        <button 
          onClick={handleSimulate}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Simulate Failure
        </button>
      </div>

      {impactedNodes.length > 0 && (
        <div style={{ padding: '10px', background: '#ef4444', color: '#fff', borderRadius: '4px', marginBottom: '20px' }}>
          ⚠️ Blast Radius Impact: {impactedNodes.length} entities impacted downstream!
        </div>
      )}

      <SupplyGraph 
        graphData={graphData} 
        impactedNodes={impactedNodes} 
        selectedSupplier={selectedSupplier} 
      />
    </div>
  );
}

export default App;
