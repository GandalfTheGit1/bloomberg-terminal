// Event Graph data structure with acyclicity validation
// Implements directed acyclic graph (DAG) for causal relationships between events

import { Event, EventGraph, CausalEdge } from '@/types/models';

/**
 * EventGraph class for managing causal relationships between events
 * Ensures the graph remains acyclic (DAG) at all times
 */
export class EventGraphManager {
  private companyId: string;
  private nodes: Map<string, Event>;
  private edges: Map<string, CausalEdge>;
  private adjacencyList: Map<string, Set<string>>;
  private lastUpdated: Date;

  constructor(companyId: string, initialGraph?: EventGraph) {
    this.companyId = companyId;
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.lastUpdated = new Date();

    if (initialGraph) {
      this.loadFromGraph(initialGraph);
    }
  }

  /**
   * Load graph from EventGraph interface
   */
  private loadFromGraph(graph: EventGraph): void {
    // Load nodes
    for (const event of graph.nodes) {
      this.nodes.set(event.id, event);
      this.adjacencyList.set(event.id, new Set());
    }

    // Load edges
    for (const edge of graph.edges) {
      const edgeKey = `${edge.from}-${edge.to}`;
      this.edges.set(edgeKey, edge);
      
      // Update adjacency list
      if (!this.adjacencyList.has(edge.from)) {
        this.adjacencyList.set(edge.from, new Set());
      }
      this.adjacencyList.get(edge.from)!.add(edge.to);
    }

    this.lastUpdated = graph.lastUpdated;
  }

  /**
   * Add a node (event) to the graph
   */
  addNode(event: Event): boolean {
    if (this.nodes.has(event.id)) {
      return false; // Node already exists
    }

    this.nodes.set(event.id, event);
    this.adjacencyList.set(event.id, new Set());
    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Remove a node and all its edges from the graph
   */
  removeNode(eventId: string): boolean {
    if (!this.nodes.has(eventId)) {
      return false; // Node doesn't exist
    }

    // Remove all edges involving this node
    const edgesToRemove: string[] = [];
    
    for (const [edgeKey, edge] of this.edges) {
      if (edge.from === eventId || edge.to === eventId) {
        edgesToRemove.push(edgeKey);
      }
    }

    for (const edgeKey of edgesToRemove) {
      const edge = this.edges.get(edgeKey)!;
      this.edges.delete(edgeKey);
      
      // Update adjacency list
      if (this.adjacencyList.has(edge.from)) {
        this.adjacencyList.get(edge.from)!.delete(edge.to);
      }
    }

    // Remove the node
    this.nodes.delete(eventId);
    this.adjacencyList.delete(eventId);
    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Add an edge between two nodes, ensuring no cycles are created
   */
  addEdge(edge: CausalEdge): boolean {
    const { from, to } = edge;

    // Check if both nodes exist
    if (!this.nodes.has(from) || !this.nodes.has(to)) {
      return false; // One or both nodes don't exist
    }

    // Check if edge already exists
    const edgeKey = `${from}-${to}`;
    if (this.edges.has(edgeKey)) {
      return false; // Edge already exists
    }

    // Temporarily add the edge to check for cycles
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, new Set());
    }
    this.adjacencyList.get(from)!.add(to);

    // Check if adding this edge would create a cycle
    if (!this.isAcyclic()) {
      // Remove the temporarily added edge
      this.adjacencyList.get(from)!.delete(to);
      return false; // Would create a cycle
    }

    // Edge is safe to add
    this.edges.set(edgeKey, edge);
    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Remove an edge from the graph
   */
  removeEdge(from: string, to: string): boolean {
    const edgeKey = `${from}-${to}`;
    
    if (!this.edges.has(edgeKey)) {
      return false; // Edge doesn't exist
    }

    this.edges.delete(edgeKey);
    
    // Update adjacency list
    if (this.adjacencyList.has(from)) {
      this.adjacencyList.get(from)!.delete(to);
    }

    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Check if the graph is acyclic using Depth-First Search (DFS)
   * Returns true if acyclic (no cycles), false if cycles exist
   */
  isAcyclic(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    // Check each node as a potential starting point
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (this.hasCycleDFS(nodeId, visited, recursionStack)) {
          return false; // Cycle found
        }
      }
    }

    return true; // No cycles found
  }

  /**
   * DFS helper function to detect cycles
   */
  private hasCycleDFS(
    nodeId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Visit all adjacent nodes
    const neighbors = this.adjacencyList.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (this.hasCycleDFS(neighbor, visited, recursionStack)) {
          return true; // Cycle found in recursion
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // Back edge found - cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  /**
   * Get all nodes in the graph
   */
  getNodes(): Event[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges in the graph
   */
  getEdges(): CausalEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Get a specific node by ID
   */
  getNode(eventId: string): Event | undefined {
    return this.nodes.get(eventId);
  }

  /**
   * Get all edges from a specific node
   */
  getEdgesFrom(eventId: string): CausalEdge[] {
    const edges: CausalEdge[] = [];
    const neighbors = this.adjacencyList.get(eventId) || new Set();
    
    for (const neighbor of neighbors) {
      const edgeKey = `${eventId}-${neighbor}`;
      const edge = this.edges.get(edgeKey);
      if (edge) {
        edges.push(edge);
      }
    }
    
    return edges;
  }

  /**
   * Get all edges to a specific node
   */
  getEdgesTo(eventId: string): CausalEdge[] {
    const edges: CausalEdge[] = [];
    
    for (const edge of this.edges.values()) {
      if (edge.to === eventId) {
        edges.push(edge);
      }
    }
    
    return edges;
  }

  /**
   * Check if there's a path between two nodes
   */
  hasPath(fromId: string, toId: string): boolean {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      return false;
    }

    // If checking for self-path, only return true if there's an actual cycle
    if (fromId === toId) {
      const visited = new Set<string>();
      const neighbors = this.adjacencyList.get(fromId) || new Set();
      
      for (const neighbor of neighbors) {
        if (this.hasPathHelper(neighbor, toId, visited)) {
          return true;
        }
      }
      return false;
    }

    const visited = new Set<string>();
    return this.hasPathHelper(fromId, toId, visited);
  }

  /**
   * Helper method for path finding
   */
  private hasPathHelper(fromId: string, toId: string, visited: Set<string>): boolean {
    if (fromId === toId) {
      return true;
    }

    if (visited.has(fromId)) {
      return false;
    }

    visited.add(fromId);
    const neighbors = this.adjacencyList.get(fromId) || new Set();
    
    for (const neighbor of neighbors) {
      if (this.hasPathHelper(neighbor, toId, visited)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the shortest path between two nodes
   */
  getShortestPath(fromId: string, toId: string): string[] | null {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      return null;
    }

    const visited = new Set<string>();
    const queue = [{ nodeId: fromId, path: [fromId] }];
    visited.add(fromId);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === toId) {
        return path;
      }

      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ nodeId: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Convert to EventGraph interface for serialization
   */
  toEventGraph(): EventGraph {
    return {
      companyId: this.companyId,
      nodes: this.getNodes(),
      edges: this.getEdges(),
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    isAcyclic: boolean;
    lastUpdated: Date;
  } {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      isAcyclic: this.isAcyclic(),
      lastUpdated: this.lastUpdated
    };
  }
}

/**
 * Utility function to create a new EventGraphManager
 */
export function createEventGraph(companyId: string, initialGraph?: EventGraph): EventGraphManager {
  return new EventGraphManager(companyId, initialGraph);
}

/**
 * Utility function to validate if an EventGraph is acyclic
 */
export function validateEventGraphAcyclicity(graph: EventGraph): boolean {
  const manager = new EventGraphManager(graph.companyId, graph);
  return manager.isAcyclic();
}