export const methodQueries = {
  getAllMethods: `
    MATCH (m:Method)
    OPTIONAL MATCH (p:Paper)-[:USES_METHOD]->(m)
    WITH m, count(DISTINCT p) AS paperCount
    RETURN m, paperCount
    ORDER BY paperCount DESC, m.name ASC
  `,

  getMethodById: `
    MATCH (m:Method {id: $methodId})
    RETURN m
  `,

  getPapersUsingMethod: `
    MATCH (p:Paper)-[:USES_METHOD]->(m:Method {id: $methodId})
    RETURN p
    ORDER BY p.publicationYear DESC
  `,
};
