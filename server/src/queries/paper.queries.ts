export const paperQueries = {
  getPaperById: `
    MATCH (p:Paper {id: $paperId})
    RETURN p
  `,

  getPapersFiltered: `
    MATCH (p:Paper)
    WHERE ($search IS NULL OR toLower(p.title) CONTAINS toLower($search))
      AND ($year IS NULL OR p.publicationYear = $year)
      AND ($topicId IS NULL OR (p)-[:ABOUT]->(:Topic {id: $topicId}))
      AND ($methodId IS NULL OR (p)-[:USES_METHOD]->(:Method {id: $methodId}))
      AND ($datasetId IS NULL OR (p)-[:USES_DATASET]->(:Dataset {id: $datasetId}))
    RETURN p
    ORDER BY p.publicationYear DESC, p.title ASC
    SKIP $skip
    LIMIT $limit
  `,

  countPapersFiltered: `
    MATCH (p:Paper)
    WHERE ($search IS NULL OR toLower(p.title) CONTAINS toLower($search))
      AND ($year IS NULL OR p.publicationYear = $year)
      AND ($topicId IS NULL OR (p)-[:ABOUT]->(:Topic {id: $topicId}))
      AND ($methodId IS NULL OR (p)-[:USES_METHOD]->(:Method {id: $methodId}))
      AND ($datasetId IS NULL OR (p)-[:USES_DATASET]->(:Dataset {id: $datasetId}))
    RETURN count(p) AS total
  `,

  getAuthors: `
    MATCH (r:Researcher)-[:AUTHORED]->(p:Paper {id: $paperId})
    RETURN r
    ORDER BY r.name ASC
  `,

  getTopics: `
    MATCH (p:Paper {id: $paperId})-[:ABOUT]->(t:Topic)
    RETURN t
    ORDER BY t.name ASC
  `,

  getMethods: `
    MATCH (p:Paper {id: $paperId})-[:USES_METHOD]->(m:Method)
    RETURN m
    ORDER BY m.name ASC
  `,

  getDatasets: `
    MATCH (p:Paper {id: $paperId})-[:USES_DATASET]->(d:Dataset)
    RETURN d
    ORDER BY d.name ASC
  `,

  getCitations: `
    MATCH (p:Paper {id: $paperId})
    OPTIONAL MATCH (p)-[:CITES]->(citesPaper:Paper)
    OPTIONAL MATCH (citedByPaper:Paper)-[:CITES]->(p)
    RETURN 
      collect(DISTINCT citesPaper) AS cites,
      collect(DISTINCT citedByPaper) AS citedBy
  `,

  // Multi-hop Query: Citation Lineage (arbitrary depth up to $maxDepth)
  getCitationLineage: `
    MATCH path = (p:Paper {id: $paperId})-[:CITES*1..3]->(ancestor:Paper)
    UNWIND nodes(path) AS n
    UNWIND relationships(path) AS r
    RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS edges
  `,

  // Explainable Related Papers Query: Computes shared topics, shared methods, shared datasets, co-authorship
  getRelatedPapers: `
    MATCH (p:Paper {id: $paperId})
    MATCH (other:Paper) WHERE other.id <> p.id
    OPTIONAL MATCH (p)-[:ABOUT]->(st:Topic)<-[:ABOUT]-(other)
    OPTIONAL MATCH (p)-[:USES_METHOD]->(sm:Method)<-[:USES_METHOD]-(other)
    OPTIONAL MATCH (p)-[:USES_DATASET]->(sd:Dataset)<-[:USES_DATASET]-(other)
    OPTIONAL MATCH (p)<-[:AUTHORED]-(:Researcher)-[:COLLABORATED_WITH]-(:Researcher)-[:AUTHORED]->(other)
    WITH other,
      collect(DISTINCT st.name) AS sharedTopics,
      collect(DISTINCT sm.name) AS sharedMethods,
      collect(DISTINCT sd.name) AS sharedDatasets,
      (count(DISTINCT st) * 3 + count(DISTINCT sm) * 2 + count(DISTINCT sd) * 2) AS score
    WHERE score > 0
    RETURN other, sharedTopics, sharedMethods, sharedDatasets, score
    ORDER BY score DESC
    LIMIT $limit
  `,
};
