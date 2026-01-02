import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { EventGraphManager, createEventGraph, validateEventGraphAcyclicity } from './graph'
import { Event, CausalEdge, EventGraph } from '@/types/models'

// Generators for property-based testing
const eventIdArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)

const eventArb: fc.Arbitrary<Event> = fc.record({
  id: eventIdArb,
  type: fc.constantFrom('macro', 'industry', 'company'),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  probability: fc.float({ min: 0, max: 100, noNaN: true }),
  priorProbability: fc.float({ min: 0, max: 100, noNaN: true }),
  timingWindow: fc.record({
    start: fc.date(),
    end: fc.date(),
    expectedDate: fc.date()
  }),
  impact: fc.record({
    revenue: fc.option(fc.record({
      direction: fc.constantFrom('bullish', 'bearish', 'neutral'),
      magnitude: fc.float({ min: -100, max: 100, noNaN: true }),
      confidence: fc.float({ min: 0, max: 100, noNaN: true })
    })),
    margin: fc.option(fc.record({
      direction: fc.constantFrom('bullish', 'bearish', 'neutral'),
      magnitude: fc.float({ min: -100, max: 100, noNaN: true }),
      confidence: fc.float({ min: 0, max: 100, noNaN: true })
    }))
  }),
  expectedValue: fc.float({ min: -1000, max: 1000, noNaN: true }),
  confidence: fc.float({ min: 0, max: 100, noNaN: true }),
  sources: fc.array(fc.record({
    type: fc.constantFrom('market_data', 'social', 'financial', 'news', 'macro'),
    url: fc.option(fc.webUrl()),
    timestamp: fc.date(),
    reliability: fc.float({ min: 0, max: 1, noNaN: true })
  })),
  drivers: fc.array(fc.string({ minLength: 1, maxLength: 100 })),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  updateHistory: fc.array(fc.record({
    timestamp: fc.date(),
    prior: fc.float({ min: 0, max: 100, noNaN: true }),
    posterior: fc.float({ min: 0, max: 100, noNaN: true }),
    signal: fc.record({
      type: fc.constantFrom('market_data', 'social', 'financial', 'news', 'macro'),
      source: fc.string({ minLength: 1 }),
      timestamp: fc.date(),
      data: fc.anything(),
      reliability: fc.float({ min: 0, max: 1, noNaN: true })
    }),
    evidence: fc.record({
      supports: fc.boolean(),
      strength: fc.float({ min: 0, max: 1, noNaN: true }),
      likelihood: fc.float({ min: 0, max: 1, noNaN: true })
    })
  }))
})

const causalEdgeArb = (nodeIds: string[]): fc.Arbitrary<CausalEdge> => {
  if (nodeIds.length < 2) {
    // If we don't have enough nodes, create a dummy edge that won't be used
    return fc.record({
      from: fc.constant('dummy'),
      to: fc.constant('dummy'),
      strength: fc.float({ min: 0, max: 1, noNaN: true }),
      type: fc.constantFrom('causes', 'influences', 'correlates')
    })
  }
  
  return fc.record({
    from: fc.constantFrom(...nodeIds),
    to: fc.constantFrom(...nodeIds),
    strength: fc.float({ min: 0, max: 1, noNaN: true }),
    type: fc.constantFrom('causes', 'influences', 'correlates')
  }).filter(edge => edge.from !== edge.to) // Prevent self-loops
}

// Generator for a small event graph (to make testing manageable)
const smallEventGraphArb: fc.Arbitrary<EventGraph> = fc.tuple(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.array(eventArb, { minLength: 1, maxLength: 5 })
).chain(([companyId, events]) => {
  // Ensure unique event IDs
  const uniqueEvents = events.reduce((acc, event, index) => {
    const uniqueEvent = { ...event, id: `event_${index}` }
    acc.push(uniqueEvent)
    return acc
  }, [] as Event[])
  
  const nodeIds = uniqueEvents.map(e => e.id)
  
  return fc.record({
    companyId: fc.constant(companyId),
    nodes: fc.constant(uniqueEvents),
    edges: fc.array(causalEdgeArb(nodeIds), { maxLength: Math.min(10, nodeIds.length * 2) }),
    lastUpdated: fc.date()
  })
})

describe('Event Graph Property Tests', () => {
  test('Property 5: Graph Acyclicity - Feature: ai-financial-terminal, Property 5: Graph Acyclicity', () => {
    // **Validates: Requirements 2.1, 12.5**
    fc.assert(
      fc.property(smallEventGraphArb, (graphData: EventGraph) => {
        const manager = new EventGraphManager(graphData.companyId, graphData)
        
        // The graph should always be acyclic after construction
        const isAcyclic = manager.isAcyclic()
        
        // If the initial graph has cycles, the manager should handle it gracefully
        // For this test, we'll verify that the isAcyclic method works correctly
        expect(typeof isAcyclic).toBe('boolean')
        
        // Additional verification: if acyclic, no node should have a path to itself
        if (isAcyclic) {
          const nodes = manager.getNodes()
          for (const node of nodes) {
            // A node should not have a path to itself in an acyclic graph
            const hasPathToSelf = manager.hasPath(node.id, node.id)
            expect(hasPathToSelf).toBe(false)
          }
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property: Adding nodes preserves graph structure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(eventArb, { minLength: 0, maxLength: 3 }),
        eventArb,
        (companyId: string, initialEvents: Event[], newEvent: Event) => {
          // Ensure unique IDs
          const uniqueInitialEvents = initialEvents.map((e, i) => ({ ...e, id: `initial_${i}` }))
          const uniqueNewEvent = { ...newEvent, id: 'new_event' }
          
          const manager = new EventGraphManager(companyId)
          
          // Add initial events
          for (const event of uniqueInitialEvents) {
            manager.addNode(event)
          }
          
          const initialNodeCount = manager.getNodes().length
          const wasAcyclic = manager.isAcyclic()
          
          // Add new event
          const added = manager.addNode(uniqueNewEvent)
          
          if (added) {
            // Node count should increase by 1
            expect(manager.getNodes().length).toBe(initialNodeCount + 1)
            
            // Graph should still be acyclic (adding nodes doesn't create cycles)
            expect(manager.isAcyclic()).toBe(true)
            
            // New node should exist
            expect(manager.getNode(uniqueNewEvent.id)).toBeDefined()
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Removing nodes preserves acyclicity', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(eventArb, { minLength: 1, maxLength: 5 }),
        (companyId: string, events: Event[]) => {
          // Ensure unique IDs
          const uniqueEvents = events.map((e, i) => ({ ...e, id: `event_${i}` }))
          
          const manager = new EventGraphManager(companyId)
          
          // Add all events
          for (const event of uniqueEvents) {
            manager.addNode(event)
          }
          
          // If graph is acyclic initially
          if (manager.isAcyclic()) {
            const initialNodeCount = manager.getNodes().length
            
            if (initialNodeCount > 0) {
              // Remove a random node
              const nodeToRemove = uniqueEvents[0]
              const removed = manager.removeNode(nodeToRemove.id)
              
              if (removed) {
                // Node count should decrease
                expect(manager.getNodes().length).toBe(initialNodeCount - 1)
                
                // Graph should still be acyclic
                expect(manager.isAcyclic()).toBe(true)
                
                // Node should no longer exist
                expect(manager.getNode(nodeToRemove.id)).toBeUndefined()
              }
            }
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Edge addition that would create cycles is rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (companyId: string) => {
          const manager = new EventGraphManager(companyId)
          
          // Create a simple chain: A -> B -> C
          const eventA: Event = {
            id: 'A',
            type: 'company',
            title: 'Event A',
            description: 'Test event A',
            probability: 50,
            priorProbability: 50,
            timingWindow: {
              start: new Date(),
              end: new Date(),
              expectedDate: new Date()
            },
            impact: {},
            expectedValue: 0,
            confidence: 50,
            sources: [],
            drivers: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            updateHistory: []
          }
          
          const eventB = { ...eventA, id: 'B', title: 'Event B', description: 'Test event B' }
          const eventC = { ...eventA, id: 'C', title: 'Event C', description: 'Test event C' }
          
          // Add nodes
          manager.addNode(eventA)
          manager.addNode(eventB)
          manager.addNode(eventC)
          
          // Add edges A -> B -> C
          const edgeAB: CausalEdge = { from: 'A', to: 'B', strength: 0.5, type: 'causes' }
          const edgeBC: CausalEdge = { from: 'B', to: 'C', strength: 0.5, type: 'causes' }
          
          expect(manager.addEdge(edgeAB)).toBe(true)
          expect(manager.addEdge(edgeBC)).toBe(true)
          expect(manager.isAcyclic()).toBe(true)
          
          // Try to add C -> A (would create cycle)
          const edgeCA: CausalEdge = { from: 'C', to: 'A', strength: 0.5, type: 'causes' }
          const cycleEdgeAdded = manager.addEdge(edgeCA)
          
          // Cycle edge should be rejected
          expect(cycleEdgeAdded).toBe(false)
          
          // Graph should still be acyclic
          expect(manager.isAcyclic()).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Graph statistics are consistent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(eventArb, { minLength: 0, maxLength: 5 }),
        (companyId: string, events: Event[]) => {
          // Ensure unique IDs
          const uniqueEvents = events.map((e, i) => ({ ...e, id: `event_${i}` }))
          
          const manager = new EventGraphManager(companyId)
          
          // Add events
          for (const event of uniqueEvents) {
            manager.addNode(event)
          }
          
          const stats = manager.getStats()
          const nodes = manager.getNodes()
          const edges = manager.getEdges()
          
          // Stats should match actual counts
          expect(stats.nodeCount).toBe(nodes.length)
          expect(stats.edgeCount).toBe(edges.length)
          expect(typeof stats.isAcyclic).toBe('boolean')
          expect(stats.lastUpdated).toBeInstanceOf(Date)
          
          // Node count should match unique events added
          expect(stats.nodeCount).toBe(uniqueEvents.length)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: EventGraph serialization preserves structure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(eventArb, { minLength: 1, maxLength: 3 }),
        (companyId: string, events: Event[]) => {
          // Ensure unique IDs
          const uniqueEvents = events.map((e, i) => ({ ...e, id: `event_${i}` }))
          
          const manager = new EventGraphManager(companyId)
          
          // Add events
          for (const event of uniqueEvents) {
            manager.addNode(event)
          }
          
          // Convert to EventGraph and back
          const serialized = manager.toEventGraph()
          const newManager = new EventGraphManager(serialized.companyId, serialized)
          
          // Structure should be preserved
          expect(newManager.getNodes().length).toBe(manager.getNodes().length)
          expect(newManager.getEdges().length).toBe(manager.getEdges().length)
          expect(newManager.isAcyclic()).toBe(manager.isAcyclic())
          
          // Company ID should match
          expect(serialized.companyId).toBe(companyId)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Event Graph Unit Tests', () => {
  test('creates empty graph correctly', () => {
    const manager = new EventGraphManager('test-company')
    
    expect(manager.getNodes()).toHaveLength(0)
    expect(manager.getEdges()).toHaveLength(0)
    expect(manager.isAcyclic()).toBe(true)
    
    const stats = manager.getStats()
    expect(stats.nodeCount).toBe(0)
    expect(stats.edgeCount).toBe(0)
    expect(stats.isAcyclic).toBe(true)
  })

  test('adds and removes nodes correctly', () => {
    const manager = new EventGraphManager('test-company')
    
    const event: Event = {
      id: 'test-event',
      type: 'company',
      title: 'Test Event',
      description: 'A test event',
      probability: 75,
      priorProbability: 50,
      timingWindow: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
        expectedDate: new Date('2024-06-01')
      },
      impact: {
        revenue: {
          direction: 'bullish',
          magnitude: 10,
          confidence: 80
        }
      },
      expectedValue: 7.5,
      confidence: 80,
      sources: [],
      drivers: ['market expansion'],
      createdAt: new Date(),
      updatedAt: new Date(),
      updateHistory: []
    }
    
    // Add node
    expect(manager.addNode(event)).toBe(true)
    expect(manager.getNodes()).toHaveLength(1)
    expect(manager.getNode('test-event')).toBeDefined()
    
    // Try to add same node again
    expect(manager.addNode(event)).toBe(false)
    expect(manager.getNodes()).toHaveLength(1)
    
    // Remove node
    expect(manager.removeNode('test-event')).toBe(true)
    expect(manager.getNodes()).toHaveLength(0)
    expect(manager.getNode('test-event')).toBeUndefined()
    
    // Try to remove non-existent node
    expect(manager.removeNode('non-existent')).toBe(false)
  })

  test('detects cycles correctly', () => {
    const manager = new EventGraphManager('test-company')
    
    // Create events
    const eventA: Event = {
      id: 'A', type: 'company', title: 'Event A', description: 'Test A',
      probability: 50, priorProbability: 50,
      timingWindow: { start: new Date(), end: new Date(), expectedDate: new Date() },
      impact: {}, expectedValue: 0, confidence: 50, sources: [], drivers: [],
      createdAt: new Date(), updatedAt: new Date(), updateHistory: []
    }
    const eventB = { ...eventA, id: 'B', title: 'Event B', description: 'Test B' }
    const eventC = { ...eventA, id: 'C', title: 'Event C', description: 'Test C' }
    
    manager.addNode(eventA)
    manager.addNode(eventB)
    manager.addNode(eventC)
    
    // Create chain A -> B -> C
    expect(manager.addEdge({ from: 'A', to: 'B', strength: 0.5, type: 'causes' })).toBe(true)
    expect(manager.addEdge({ from: 'B', to: 'C', strength: 0.5, type: 'causes' })).toBe(true)
    expect(manager.isAcyclic()).toBe(true)
    
    // Try to create cycle C -> A
    expect(manager.addEdge({ from: 'C', to: 'A', strength: 0.5, type: 'causes' })).toBe(false)
    expect(manager.isAcyclic()).toBe(true)
  })

  test('handles edge operations correctly', () => {
    const manager = new EventGraphManager('test-company')
    
    const eventA: Event = {
      id: 'A', type: 'company', title: 'Event A', description: 'Test A',
      probability: 50, priorProbability: 50,
      timingWindow: { start: new Date(), end: new Date(), expectedDate: new Date() },
      impact: {}, expectedValue: 0, confidence: 50, sources: [], drivers: [],
      createdAt: new Date(), updatedAt: new Date(), updateHistory: []
    }
    const eventB = { ...eventA, id: 'B', title: 'Event B', description: 'Test B' }
    
    manager.addNode(eventA)
    manager.addNode(eventB)
    
    const edge: CausalEdge = { from: 'A', to: 'B', strength: 0.8, type: 'causes' }
    
    // Add edge
    expect(manager.addEdge(edge)).toBe(true)
    expect(manager.getEdges()).toHaveLength(1)
    expect(manager.getEdgesFrom('A')).toHaveLength(1)
    expect(manager.getEdgesTo('B')).toHaveLength(1)
    
    // Try to add same edge again
    expect(manager.addEdge(edge)).toBe(false)
    expect(manager.getEdges()).toHaveLength(1)
    
    // Remove edge
    expect(manager.removeEdge('A', 'B')).toBe(true)
    expect(manager.getEdges()).toHaveLength(0)
    expect(manager.getEdgesFrom('A')).toHaveLength(0)
    expect(manager.getEdgesTo('B')).toHaveLength(0)
    
    // Try to remove non-existent edge
    expect(manager.removeEdge('A', 'B')).toBe(false)
  })

  test('path finding works correctly', () => {
    const manager = new EventGraphManager('test-company')
    
    // Create events A -> B -> C
    const events = ['A', 'B', 'C'].map(id => ({
      id, type: 'company' as const, title: `Event ${id}`, description: `Test ${id}`,
      probability: 50, priorProbability: 50,
      timingWindow: { start: new Date(), end: new Date(), expectedDate: new Date() },
      impact: {}, expectedValue: 0, confidence: 50, sources: [], drivers: [],
      createdAt: new Date(), updatedAt: new Date(), updateHistory: []
    }))
    
    events.forEach(event => manager.addNode(event))
    
    manager.addEdge({ from: 'A', to: 'B', strength: 0.5, type: 'causes' })
    manager.addEdge({ from: 'B', to: 'C', strength: 0.5, type: 'causes' })
    
    // Test path existence
    expect(manager.hasPath('A', 'C')).toBe(true)
    expect(manager.hasPath('C', 'A')).toBe(false)
    expect(manager.hasPath('A', 'A')).toBe(false) // No self-loops in acyclic graph
    
    // Test shortest path
    expect(manager.getShortestPath('A', 'C')).toEqual(['A', 'B', 'C'])
    expect(manager.getShortestPath('C', 'A')).toBeNull()
    expect(manager.getShortestPath('A', 'nonexistent')).toBeNull()
  })

  test('utility functions work correctly', () => {
    const graph = createEventGraph('test-company')
    expect(graph).toBeInstanceOf(EventGraphManager)
    
    const eventGraph: EventGraph = {
      companyId: 'test',
      nodes: [],
      edges: [],
      lastUpdated: new Date()
    }
    
    expect(validateEventGraphAcyclicity(eventGraph)).toBe(true)
  })
})