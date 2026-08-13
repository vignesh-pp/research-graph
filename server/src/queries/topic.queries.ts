export const topicQueries = {
  getAllTopics: `
    MATCH (t:Topic)
    OPTIONAL MATCH (p:Paper)-[:ABOUT]->(t)
    WITH t, count(p) AS paperCount
    RETURN t, paperCount
    ORDER BY paperCount DESC, t.name ASC
  `,

  getTopicById: `
    MATCH (t:Topic {id: $topicId})
    RETURN t
  `,

  getTopicPapers: `
    MATCH (p:Paper)-[:ABOUT]->(t:Topic {id: $topicId})
    RETURN p
    ORDER BY p.publicationYear DESC
  `,

  // Multi-hop: Topic -> Paper -> Researcher
  getTopicResearchers: `
    MATCH (r:Researcher)-[:AUTHORED]->(p:Paper)-[:ABOUT]->(t:Topic {id: $topicId})
    RETURN DISTINCT r
    ORDER BY r.name ASC
  `,

  // Multi-hop: Topic -> Paper -> Method
  getTopicMethods: `
    MATCH (t:Topic {id: $topicId})<-[:ABOUT]-(p:Paper)-[:USES_METHOD]->(m:Method)
    RETURN DISTINCT m
    ORDER BY m.name ASC
  `,

  // Multi-hop: Topic -> Paper -> Dataset
  getTopicDatasets: `
    MATCH (t:Topic {id: $topicId})<-[:ABOUT]-(p:Paper)-[:USES_DATASET]->(d:Dataset)
    RETURN DISTINCT d
    ORDER BY d.name ASC
  `,

  getRelatedTopics: `
    MATCH (t:Topic {id: $topicId})-[:RELATED_TO]-(other:Topic)
    RETURN DISTINCT other
    ORDER BY other.name ASC
  `,

  getTopicSubGraph: `
    MATCH path = (t:Topic {id: $topicId})-[:RELATED_TO*1..2]-(other:Topic)
    UNWIND nodes(path) AS n
    UNWIND relationships(path) AS rel
    RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT rel) AS edges
  `,
};
