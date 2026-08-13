# ResearchGraph — Research Knowledge Graph Application

> **Explore research through people, papers, ideas, methods, and connections.**

ResearchGraph is a full-stack, production-grade web application built for the **Wexa AI CognoDB take-home assignment**. It models scientific literature as a connected knowledge graph in **CognoDB** (using the official Neo4j JavaScript driver over the Bolt protocol) to power multi-hop graph discovery, citation lineage exploration, cross-institutional collaboration analysis, shortest research paths, and explainable related research recommendations.

---

## 1. Problem Statement

Modern scientific discovery is hindered by fragmented research literature. Traditional scholarly search engines treat research papers as isolated text documents. However, researchers, peer reviewers, and funding institutions must constantly answer complex relationship-centric questions:

* *Which researchers collaborate across distinct academic and industrial institutions?*
* *What is the full citation lineage behind a foundational discovery like Attention or Diffusion Models?*
* *How is Researcher A connected to Researcher B through shared co-authors and citations?*
* *Which machine learning methods and benchmarks bridge disparate research subfields (e.g., NLP and Biology)?*
* *Why is Paper X related to Paper Y beyond simple keyword matches?*

ResearchGraph solves this by modeling relationships as first-class citizens in a native graph database.

---

## 2. Why a Graph Database (CognoDB)?

In a relational database (SQL), answering multi-hop questions requires expensive multi-table joins or recursive Common Table Expressions (CTEs). As traversal depth increases, query complexity and execution time degrade significantly.

### Multi-Hop Traversal Examples

```text
Paper
  ↓ CITES
Paper
  ↓ AUTHORED_BY
Researcher
  ↓ AFFILIATED_WITH
Institution
```

and:

```text
Researcher
  ↓ AUTHORED
Paper
  ↓ ABOUT
Topic
  ↓ RELATED_TO
Topic
  ↓ COVERED_BY
Paper
```

### Why Relational Databases Are Awkward for Research Lineage

Consider finding the citation lineage of a paper up to an arbitrary depth:

```text
Paper A → CITES → Paper B → CITES → Paper C → CITES → Paper D
```

#### The Relational SQL Approach:
In a relational database, you must write a recursive Common Table Expression (CTE) or chain repeated self-joins on a `citations` join table:

```sql
WITH RECURSIVE CitationChain AS (
  SELECT paper_id, cited_paper_id, 1 AS depth
  FROM paper_citations
  WHERE paper_id = 'pap-001'
  UNION ALL
  SELECT c.paper_id, c.cited_paper_id, cc.depth + 1
  FROM paper_citations c
  JOIN CitationChain cc ON c.paper_id = cc.cited_paper_id
  WHERE cc.depth < 4
)
SELECT * FROM CitationChain
JOIN papers ON CitationChain.cited_paper_id = papers.id;
```

#### The CognoDB (Cypher) Approach:
In CognoDB, the graph topology is traversed directly using pointer chasing in a single clean, readable Cypher pattern:

```cypher
MATCH path = (p:Paper {id: $paperId})-[:CITES*1..3]->(ancestor:Paper)
RETURN path
```

CognoDB eliminates join overhead, enables arbitrary-depth variable-length traversals, and allows intuitive relationship property filters (`year`, `role`, `strength`).

---

## 3. Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React + Vite Client                  │
│   (TypeScript, Material UI, Lucide, Canvas/SVG Graph)  │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Express.js / Node.js                  │
│       Layered: Routes → Controllers → Services         │
│          → Repositories → Parameterized Cypher         │
└───────────────────────────┬────────────────────────────┘
                            │ Neo4j JS Driver (Bolt+s)
                            ▼
┌────────────────────────────────────────────────────────┐
│                        CognoDB                         │
│             (Cloud Graph Database Instance)            │
└────────────────────────────────────────────────────────┘
```

---

## 4. Graph Data Model

### Node Types & Properties

| Node Label | Key Properties | Description |
| :--- | :--- | :--- |
| **`Researcher`** | `id`, `name`, `email`, `bio`, `researchInterest` | Scientific authors & principal investigators |
| **`Paper`** | `id`, `title`, `abstract`, `publicationYear`, `venue`, `doi`, `url` | Peer-reviewed publications and preprints |
| **`Topic`** | `id`, `name`, `category`, `description` | Scientific domains & subdisciplines |
| **`Institution`** | `id`, `name`, `location`, `type` | Universities, research institutes, and AI labs |
| **`Method`** | `id`, `name`, `category`, `description` | Core algorithms, architectures & techniques |
| **`Dataset`** | `id`, `name`, `domain`, `url`, `description` | Benchmarks, evaluation datasets & corpora |
| **`ResearchProject`** | `id`, `name`, `startYear`, `status`, `description` | Large multi-institutional research initiatives |

### Typed Relationships

```text
Researcher       -[:AUTHORED]->          Paper
Researcher       -[:AFFILIATED_WITH]->   Institution
Researcher       -[:COLLABORATED_WITH]-> Researcher
Paper            -[:CITES]->             Paper
Paper            -[:ABOUT]->             Topic
Paper            -[:USES_METHOD]->       Method
Paper            -[:USES_DATASET]->      Dataset
ResearchProject  -[:INVOLVES]->          Researcher
ResearchProject  -[:PRODUCED]->          Paper
Method           -[:RELATED_TO]->        Method
Topic            -[:RELATED_TO]->        Topic
```

---

## 5. Main Cypher Queries

All queries are strictly parameterized for SQL/Cypher injection prevention and maximum database query plan caching.

### 1. Research Citation Lineage (Multi-hop)
```cypher
MATCH path = (p:Paper {id: $paperId})-[:CITES*1..3]->(ancestor:Paper)
UNWIND nodes(path) AS n
UNWIND relationships(path) AS r
RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS edges
```

### 2. Researcher 2-Hop Collaboration Network
```cypher
MATCH path = (r:Researcher {id: $researcherId})-[:COLLABORATED_WITH*1..2]-(c:Researcher)
UNWIND nodes(path) AS n
UNWIND relationships(path) AS rel
RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT rel) AS edges
```

### 3. Cross-Institution Collaboration Discovery
```cypher
MATCH (i1:Institution {id: $institutionId})<-[:AFFILIATED_WITH]-(r1:Researcher)
      -[c:COLLABORATED_WITH]-(r2:Researcher)-[:AFFILIATED_WITH]->(i2:Institution)
WHERE i1.id <> i2.id
RETURN DISTINCT i1, r1, c, r2, i2
LIMIT 30
```

### 4. Shortest Research Path Finder
```cypher
MATCH (start {id: $startId}), (target {id: $targetId})
MATCH path = shortestPath((start)-[*..6]-(target))
RETURN path
```

### 5. Explainable Related Research
```cypher
MATCH (p:Paper {id: $paperId})
MATCH (other:Paper) WHERE other.id <> p.id
OPTIONAL MATCH (p)-[:ABOUT]->(st:Topic)<-[:ABOUT]-(other)
OPTIONAL MATCH (p)-[:USES_METHOD]->(sm:Method)<-[:USES_METHOD]-(other)
OPTIONAL MATCH (p)-[:USES_DATASET]->(sd:Dataset)<-[:USES_DATASET]-(other)
WITH other,
  collect(DISTINCT st.name) AS sharedTopics,
  collect(DISTINCT sm.name) AS sharedMethods,
  collect(DISTINCT sd.name) AS sharedDatasets,
  (count(DISTINCT st) * 3 + count(DISTINCT sm) * 2 + count(DISTINCT sd) * 2) AS score
WHERE score > 0
RETURN other, sharedTopics, sharedMethods, sharedDatasets, score
ORDER BY score DESC
LIMIT $limit
```

---

## 6. Seed Data Scale

The seed data in `server/scripts/seed.ts` generates a densely interconnected realistic AI research graph:

* **55+ Researchers**: Senior scientists and faculty across global institutions (Stanford, MIT, Berkeley, DeepMind, FAIR, Oxford, ETH Zurich).
* **108+ Papers**: Landmark papers (Attention Is All You Need, GPT-3, FlashAttention, LoRA, Mamba, AlphaFold, DDPM, ResNet, ViT, CLIP) plus interconnected domain literature (2016–2024).
* **32+ Topics**: LLMs, Diffusion, Graph Neural Networks, Alignment, RAG, Quantization, Mechanistic Interpretability, etc.
* **16+ Institutions**: Academic universities and premier industrial AI research labs.
* **26+ Methods**: Low-Rank Adaptation (LoRA), FlashAttention, DPO, PPO, Mamba SSM, GCN, GAT, NeRF, etc.
* **21+ Datasets**: OpenWebText, OGB, HumanEval, MMLU, LAION-5B, Cora, PubMed, Chatbot Arena, etc.
* **16+ Research Projects**: Alignment, Graph Foundation Models, Hardware-Aware Attention, etc.
* **180+ Citation Edges** & **60+ Collaboration Edges**.

---

## 7. Getting Started & Setup Guide

### Prerequisites
* Node.js (v18+ or v20+)
* npm (v9+)
* CognoDB Cloud Account or local Neo4j instance

### Step 1: Clone and Configure Environment

```bash
# Clone the repository
git clone https://github.com/your-username/research-graph.git
cd research-graph

# Copy environment example
cp .env.example .env
```

Edit `.env` with your desired configuration:

```env
# ==========================================
# Option A: Live CognoDB Cloud Instance (Recommended)
# ==========================================
IS_MOCK=false
COGNODB_URI=bolt+s://your-instance.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your-secure-password

# ==========================================
# Option B: In-Memory Mock Graph Mode (Offline Preview)
# ==========================================
# IS_MOCK=true

PORT=5000
CLIENT_URL=http://localhost:5173
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Seed CognoDB

```bash
cd server
npm run seed
cd ..
```

### Step 4: Run the Backend & Frontend

In terminal 1 (Backend):
```bash
cd server
npm run dev
```

In terminal 2 (Frontend):
```bash
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 8. Application Features

1. **Research Dashboard (`/dashboard`)**: Key metric counters, popular topics, most connected researchers, most cited papers, and publication trends by year.
2. **Paper Explorer (`/papers`)**: Search by title, filter by year, topic, method, dataset, with pagination.
3. **Paper Details (`/papers/:id`)**: Abstract, DOI, author links, topics, methods, datasets, citation network, interactive citation lineage graph, and explainable related research cards with verified graph badges.
4. **Researcher Explorer & Details (`/researchers`, `/researchers/:id`)**: Affiliations, research interests, authored publications, collaborator directory, and interactive 2-hop collaboration network graph.
5. **Topic Explorer & Details (`/topics`, `/topics/:id`)**: Domain taxonomy, related sub-topics, connected researchers, methods, and topic graph.
6. **Institution Explorer & Details (`/institutions`, `/institutions/:id`)**: University/Lab directory with multi-hop cross-institution collaboration graph.
7. **Methods & Datasets Explorers (`/methods`, `/datasets`)**: Category and domain filterable directories linking directly to all utilizing papers.
8. **Knowledge Graph Explorer (`/graph`)**: Interactive canvas/SVG visualizer supporting entity selection, depth selector (Depth 1, 2, 3), zoom/pan controls, relationship labels, node expansion, and inspection panel.
9. **Research Path Finder (`/path`)**: Multi-hop path finding between any two researchers, papers, or institutions with visual rendering and step-by-step traversal explanations.
10. **Global Search (`/search`)**: Unified search across all entity types with relationship-oriented suggestions.

---

## 9. Verification & Testing

Run the automated backend test suite:

```bash
cd server
npm test
```

Run frontend typecheck and production build:

```bash
npm run typecheck
npm run build
```

---

## 10. License

MIT License. Developed for the Wexa AI CognoDB take-home assignment.
