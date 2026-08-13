import neo4j, { Driver, Session, Record as Neo4jRecord } from "neo4j-driver";
import { config } from "../config/env.js";
import type { GraphNode, GraphEdge, NodeType, RelationshipType } from "../types/graph.types.js";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      config.cognodb.uri,
      neo4j.auth.basic(config.cognodb.username, config.cognodb.password),
      {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 20000,
        disableLosslessIntegers: true,
      }
    );
  }
  return driver;
}

export async function verifyConnection(): Promise<boolean> {
  try {
    const d = getDriver();
    await d.verifyConnectivity();
    return true;
  } catch (err) {
    console.warn("CognoDB connection verification failed:", (err as Error).message);
    return false;
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
    console.log("CognoDB driver connection closed successfully.");
  }
}

export function getSession(database?: string): Session {
  const d = getDriver();
  return d.session({ database });
}

export async function executeQuery<T = any>(
  cypher: string,
  params: Record<string, any> = {}
): Promise<Neo4jRecord[]> {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export function neo4jNodeToGraphNode(node: any): GraphNode {
  if (!node) throw new Error("Invalid Neo4j node");
  const properties = node.properties || {};
  const labels: string[] = node.labels || [];
  const type = (labels[0] || "Paper") as NodeType;
  const label =
    properties.name ||
    properties.title ||
    properties.id ||
    "Untitled";

  return {
    id: properties.id || String(node.identity || node.elementId || ""),
    type,
    label,
    properties,
  };
}

export function neo4jRelToGraphEdge(rel: any, sourceId?: string, targetId?: string): GraphEdge {
  if (!rel) throw new Error("Invalid Neo4j relationship");
  const properties = rel.properties || {};
  return {
    id: String(rel.identity || rel.elementId || Math.random().toString(36).substring(2)),
    source: sourceId || String(rel.startNodeElementId || rel.start || ""),
    target: targetId || String(rel.endNodeElementId || rel.end || ""),
    type: (rel.type || "RELATED_TO") as RelationshipType,
    properties,
  };
}
