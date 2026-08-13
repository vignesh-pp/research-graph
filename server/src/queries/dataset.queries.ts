export const datasetQueries = {
  getAllDatasets: `
    MATCH (d:Dataset)
    OPTIONAL MATCH (p:Paper)-[:USES_DATASET]->(d)
    WITH d, count(DISTINCT p) AS paperCount
    RETURN d, paperCount
    ORDER BY paperCount DESC, d.name ASC
  `,

  getDatasetById: `
    MATCH (d:Dataset {id: $datasetId})
    RETURN d
  `,

  getPapersUsingDataset: `
    MATCH (p:Paper)-[:USES_DATASET]->(d:Dataset {id: $datasetId})
    RETURN p
    ORDER BY p.publicationYear DESC
  `,
};
