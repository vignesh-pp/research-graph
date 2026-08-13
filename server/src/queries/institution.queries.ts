export const institutionQueries = {
  getAllInstitutions: `
    MATCH (i:Institution)
    OPTIONAL MATCH (r:Researcher)-[:AFFILIATED_WITH]->(i)
    WITH i, count(DISTINCT r) AS researcherCount
    RETURN i, researcherCount
    ORDER BY researcherCount DESC, i.name ASC
  `,

  getInstitutionById: `
    MATCH (i:Institution {id: $institutionId})
    RETURN i
  `,

  getAffiliatedResearchers: `
    MATCH (r:Researcher)-[:AFFILIATED_WITH]->(i:Institution {id: $institutionId})
    RETURN r
    ORDER BY r.name ASC
  `,

  // Multi-hop: Institution -> Researcher -> Paper
  getInstitutionPapers: `
    MATCH (i:Institution {id: $institutionId})<-[:AFFILIATED_WITH]-(r:Researcher)-[:AUTHORED]->(p:Paper)
    RETURN DISTINCT p
    ORDER BY p.publicationYear DESC
  `,

  // Multi-hop: Cross-institution collaboration (Institution A <- Researcher A - Collaborates - Researcher B -> Institution B)
  getCrossInstitutionCollaborations: `
    MATCH (i1:Institution {id: $institutionId})<-[:AFFILIATED_WITH]-(r1:Researcher)-[c:COLLABORATED_WITH]-(r2:Researcher)-[:AFFILIATED_WITH]->(i2:Institution)
    WHERE i1.id <> i2.id
    RETURN DISTINCT i1, r1, c, r2, i2
    LIMIT 30
  `,
};
