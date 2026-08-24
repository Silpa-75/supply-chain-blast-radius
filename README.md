Supply Chain Blast-Radius Analyzer
A graph-backed web application built to visualize supply chain dependencies and simulate failure impacts down a supplier graph. Powered by CognoDB Cloud (openCypher over Bolt protocol) and a React/Cytoscape.js frontend.

🌟 Why a Graph Database?
Supply chain networks are inherently graph-structured entities. In traditional relational SQL databases, identifying cascading downstream failure points requires complex, expensive recursive Common Table Expressions (CTEs) and multi-table JOIN operations that grow exponentially in operational cost as depth increases.

By utilizing openCypher on CognoDB Cloud:

Variable-Length Pathing: Downstream impact calculation is handled using clean, native multi-hop graph traversals (MATCH (start)-[:DEPENDS_ON*1..10]->(impacted)).

Performance: Traversal performance relies on index-free adjacency rather than heavy table joins.

Intuitive Schema: Nodes represent suppliers, manufacturers, and retailers; edges naturally represent supply dependencies.

📐 Data Model Diagram
(Supplier:Entity) ---> [DEPENDS_ON] ---> (Manufacturer:Entity) ---> [DEPENDS_ON] ---> (Distributor:Entity) ---> [DEPENDS_ON] ---> (Retailer:Entity)
Node Label: :Entity

Properties: id, name, label (Supplier, Manufacturer, Distributor, Retailer)

Relationship Type: :DEPENDS_ON

🛠️ Tech Stack
Database: CognoDB Cloud (Managed Graph Database via Neo4j Bolt Protocol)

Backend: Node.js, Express, Neo4j JavaScript Driver (neo4j-driver)

Frontend: React, Vite, Cytoscape.js, Axios

Query Language: openCypher

🚀 Setup & Installation Instructions
1. Database Provisioning (CognoDB Cloud)
Sign up at console.cognodb.com.

Create a free c0 instance.

Copy your bolt+s:// URI and generated password for cognodb.

2. Environment Configuration
Create a .env file in the root folder:

Code snippet
COGNO_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNO_USER=cognodb
COGNO_PASSWORD=your_password_here
PORT=5001
3. Install Dependencies & Seed Data
Bash
# Install packages
npm install

# Seed CognoDB instance with realistic supply chain data
node seed.js
4. Run Application
Bash
# Terminal 1: Run Backend Express Server
node server.js

# Terminal 2: Run Frontend Vite UI
npm run dev
Navigate to http://localhost:5174 in your browser.

🔍 Key openCypher Queries Used
Multi-Hop Traversal Query (Blast Radius Simulation)
Uses parameterized openCypher queries to execute variable-length path traversal without string concatenation:

Cypher
MATCH (start:Entity {id: $supplierId})-[r:DEPENDS_ON*1..10]->(impacted:Entity)
RETURN DISTINCT impacted.id AS id
Full Graph Fetch
Cypher
MATCH (n:Entity)
OPTIONAL MATCH (n)-[r:DEPENDS_ON]->(m:Entity)
RETURN n, r, m
