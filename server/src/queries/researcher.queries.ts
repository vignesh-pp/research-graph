export const researcherQueries = {
  getResearcherById: `
    MATCH (r:Researcher {id: $researcherId})
    RETURN r
  `,

  getResearchersFiltered: `
    MATCH (r:Researcher)
    WHERE ($search IS NULL OR toLower(r.name) CONTAINS toLower($search) OR toLower(r.researchInterest) CONTAINS toLower($search))
      AND ($institutionId IS NULL OR (r)-[:AFFILIATED_WITH]->(:Institution {id: $institutionId}))
      AND ($topicId IS NULL OR (r)-[:AUTHORED]->(:Paper)-[:ABOUT]->(:Topic {id: $topicId}))
    RETURN r
    ORDER BY r.name ASC
    SKIP $skip
    LIMIT $limit
  `,

  countResearchersFiltered: `
    MATCH (r:Researcher)
    WHERE ($search IS NULL OR toLower(r.name) CONTAINS toLower($search) OR toLower(r.researchInterest) CONTAINS toLower($search))
      AND ($institutionId IS NULL OR (r)-[:AFFILIATED_WITH]->(:Institution {id: $institutionId}))
      AND ($topicId IS NULL OR (r)-[:AUTHORED]->(:Paper)-[:ABOUT]->(:Topic {id: $topicId}))
    RETURN count(r) AS total
  `,

  getAffiliatedInstitution: `
    MATCH (r:Researcher {id: $researcherId})-[:AFFILIATED_WITH]->(i:Institution)
    RETURN i
    LIMIT 1
  `,

  getAuthoredPapers: `
    MATCH (r:Researcher {id: $researcherId})-[:AUTHORED]->(p:Paper)
    RETURN p
    ORDER BY p.publicationYear DESC
  `,

  // Multi-hop collaboration query: find directly collaborated researchers & co-authors
  getCollaborators: `
    MATCH (r:Researcher {id: $researcherId})
    MATCH (r)-[:COLLABORATED_WITH]-(c:Researcher)
    RETURN DISTINCT c
    ORDER BY c.name ASC
  `,

  // Multi-hop collaboration graph (2-hop network)
  getCollaborationNetwork: `
    MATCH path = (r:Researcher {id: $researcherId})-[:COLLABORATED_WITH*1..2]-(c:Researcher)
    UNWIND nodes(path) AS n
    UNWIND relationships(path) AS rel
    RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT rel) AS edges
  `,

  getTopics: `
    MATCH (r:Researcher {id: $researcherId})-[:AUTHORED]->(:Paper)-[:ABOUT]->(t:Topic)
    RETURN DISTINCT t
    ORDER BY t.name ASC
  `,

  getMethods: `
    MATCH (r:Researcher {id: $researcherId})-[:AUTHORED]->(:Paper)-[:USES_METHOD]->(m:Method)
    RETURN DISTINCT m
    ORDER BY m.name ASC
  `,

  getDatasets: `
    MATCH (r:Researcher {id: $researcherId})-[:AUTHORED]->(:Paper)-[:USES_DATASET]->(d:Dataset)
    RETURN DISTINCT d
    ORDER BY d.name ASC
  `,

  getProjects: `
    MATCH (p:ResearchProject)-[:INVOLVES]->(r:Researcher {id: $researcherId})
    RETURN p
    ORDER BY p.startYear DESC
  `,
};
