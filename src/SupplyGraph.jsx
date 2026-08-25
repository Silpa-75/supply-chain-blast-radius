import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const SupplyGraph = ({ graphData = { nodes: [], relationships: [] }, impactedNodes = [], selectedSupplier = '' }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Safely fallback if props are missing
    const safeNodes = graphData?.nodes || [];
    const safeRelationships = graphData?.relationships || [];

    if (safeNodes.length === 0) return;

    const elements = [
      ...safeNodes.map(node => ({
        data: { id: node.id, name: node.name, label: node.label }
      })),
      ...safeRelationships.map(rel => ({
        data: { id: `${rel.source}-${rel.target}`, source: rel.source, target: rel.target }
      }))
    ];

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#2563eb',
            'label': 'data(name)',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '80px',
            'height': '80px',
            'font-size': '12px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 10
      }
    });

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [graphData]);

  // Handle color updates when simulation runs
  useEffect(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().forEach(node => {
      const nodeId = node.id();
      if (String(nodeId) === String(selectedSupplier)) {
        node.style('background-color', '#eab308'); // Yellow for origin supplier
      } else if (impactedNodes.map(String).includes(String(nodeId))) {
        node.style('background-color', '#ef4444'); // Red for impacted downstream
      } else {
        node.style('background-color', '#2563eb'); // Blue default
      }
    });
  }, [impactedNodes, selectedSupplier]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '500px', background: '#1e293b', borderRadius: '8px' }} 
    />
  );
};

export default SupplyGraph;
