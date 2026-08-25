require('dotenv').config();
const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');

const app = express();
app.use(cors());
app.use(express.json());

const driver = neo4j.driver(
  process.env.COGNO_URI,
  neo4j.auth.basic(process.env.COGNO_USER, process.env.COGNO_PASSWORD)
);

// Graceful Connection Error Handling
app.use(async (req, res, next) => {
  try {
    await driver.verifyConnectivity();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database service unavailable. Please check CognoDB connection.' });
  }
});

// Fetch full graph for layout
app.get('/api/graph', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (n:Entity)
      OPTIONAL MATCH (n)-[r:DEPENDS_ON]->(m:Entity)
      RETURN n, r, m
    `);

    const nodesMap = new Map();
    const relationships = [];

    result.records.forEach(record => {
      const node = record.get('n').properties;
      nodesMap.set(node.id, node);

      const target = record.get('m');
      if (target) {
        const targetNode = target.properties;
        nodesMap.set(targetNode.id, targetNode);
        relationships.push({ source: node.id, target: targetNode.id, type: 'DEPENDS_ON' });
      }
    });

    res.json({ nodes: Array.from(nodesMap.values()), relationships });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// Multi-hop BFS Traversal via parameterized Cypher query
app.get('/api/blast-radius/:id', async (req, res) => {
  const session = driver.session();
  try {
    const startId = String(req.params.id);
    
    // openCypher Multi-Hop Query (Variable length traversal *1..10)
    const cypherQuery = `
      MATCH (start:Entity {id: $supplierId})-[r:DEPENDS_ON*1..10]->(impacted:Entity)
      RETURN DISTINCT impacted.id AS id
    `;

    const result = await session.run(cypherQuery, { supplierId: startId });
    const impactedNodeIds = result.records.map(record => record.get('id'));

    res.json({
      supplierId: startId,
      impactedNodeCount: impactedNodeIds.length,
      impactedNodeIds: impactedNodeIds
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// Server Start Logic
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') startServer(port + 1);
  });
};

startServer(process.env.PORT || 5001);
