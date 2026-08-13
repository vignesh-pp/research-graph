export const graphQueries = {
  getDashboardStats: `
    MATCH (p:Paper) WITH count(p) AS papers
    MATCH (r:Researcher) WITH papers, count(r) AS researchers
    MATCH (t:Topic) WITH papers, researchers, count(t) AS topics
    MATCH (i:Institution) WITH papers, researchers, topics, count(i) AS institutions
    MATCH (m:Method) WITH papers, researchers, topics, institutions, count(m) AS methods
    MATCH (d:Dataset) WITH papers, researchers, topics, institutions, methods, count(d) AS datasets
    OPTIONAL MATCH ()-[cite:CITES]->() WITH papers, researchers, topics, institutions, methods, datasets, count(cite) AS citations
    OPTIONAL MATCH ()-[collab:COLLABORATED_WITH]->() WITH papers, researchers, topics, institutions, methods, datasets, citations, count(collab) / 2 AS collaborations
    RETURN papers, researchers, topics, institutions, methods, datasets, citations, collaborations
  `,

  getMostConnectedResearchers: `
    MATCH (r:Researcher)
    OPTIONAL MATCH (r)-[:AUTHORED]->(p:Paper)
    OPTIONAL MATCH (r)-[:COLLABORATED_WITH]-(c:Researcher)
    OPTIONAL MATCH (r)-[:AFFILIATED_WITH]->(i:Institution)
    WITH r, i, count(DISTINCT p) AS paperCount, count(DISTINCT c) AS collabCount
    RETURN r.id AS id, r.name AS name, coalesce(i.name, 'Independent') AS institution, paperCount AS papers, collabCount AS collaborators
    ORDER BY (papers + collaborators) DESC
    LIMIT $limit
  `,

  getMostCitedPapers: `
    MATCH (p:Paper)
    OPTIONAL MATCH (other:Paper)-[:CITES]->(p)
    WITH p, count(other) AS citationCount
    RETURN p.id AS id, p.title AS title, p.publicationYear AS year, citationCount AS citations
    ORDER BY citations DESC
    LIMIT $limit
  `,

  getActivityByYear: `
    MATCH (p:Paper)
    WHERE p.publicationYear IS NOT NULL
    RETURN p.publicationYear AS year, count(p) AS count
    ORDER BY year ASC
  `,

  // Neighborhood query up to depth 1, 2, or 3
  getNeighborhood: `
    MATCH (start {id: $nodeId})
    CALL {
      WITH start
      MATCH path = (start)-[*1..3]-(neighbor)
      WHERE length(path) <= $depth
      UNWIND nodes(path) AS n
      UNWIND relationships(path) AS r
      RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS edges
    }
    RETURN nodes, edges
  `,

  // Multi-hop Shortest Path Finder between any 2 entities in the graph
  findShortestPath: `
    MATCH (start {id: $startId}), (target {id: $targetId})
    MATCH path = shortestPath((start)-[*..6]-(target))
    RETURN path
  `,

  // Global search across entities
  searchEntities: `
    MATCH (n)
    WHERE (n:Paper OR n:Researcher OR n:Topic OR n:Institution OR n:Method OR n:Dataset)
      AND (
        toLower(coalesce(n.name, '')) CONTAINS toLower($query)
        OR toLower(coalesce(n.title, '')) CONTAINS toLower($query)
        OR toLower(coalesce(n.researchInterest, '')) CONTAINS toLower($query)
        OR toLower(coalesce(n.category, '')) CONTAINS toLower($query)
        OR toLower(coalesce(n.domain, '')) CONTAINS toLower($query)
      )
    RETURN n, labels(n)[0] AS type
    LIMIT $limit
  `,
};
