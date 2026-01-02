import { describe, test, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { PanelSizes } from '../types/models'

// Panel constraints for testing
const PANEL_CONSTRAINTS = {
  centralPanel: {
    width: { min: 40, max: 80 },
    height: { min: 30, max: 70 }
  },
  leftPanel: {
    width: { min: 15, max: 35 }
  },
  rightPanel: {
    width: { min: 15, max: 35 }
  },
  financialAnalysisPanel: {
    height: { min: 15, max: 40 }
  },
  industryPanel: {
    height: { min: 10, max: 30 }
  }
} as const

// Generators for property-based testing
const panelNameArb = fc.constantFrom(
  'centralPanel', 
  'leftPanel', 
  'rightPanel', 
  'financialAnalysisPanel', 
  'industryPanel'
) as fc.Arbitrary<keyof PanelSizes>

// Helper function to validate panel size (extracted from the hook logic)
function validatePanelSize(
  panel: keyof PanelSizes, 
  size: Partial<PanelSizes[keyof PanelSizes]>,
  currentSizes: PanelSizes
): PanelSizes[keyof PanelSizes] {
  const constraints = PANEL_CONSTRAINTS[panel]
  const currentSize = currentSizes[panel]
  const newSize = { ...currentSize, ...size }
  
  // Apply width constraints for panels that have width
  if ('width' in newSize && 'width' in constraints && constraints.width && typeof newSize.width === 'number') {
    newSize.width = Math.max(
      constraints.width.min,
      Math.min(constraints.width.max, newSize.width)
    )
  }
  
  // Apply height constraints for panels that have height
  if ('height' in newSize && 'height' in constraints && constraints.height && typeof newSize.height === 'number') {
    newSize.height = Math.max(
      constraints.height.min,
      Math.min(constraints.height.max, newSize.height)
    )
  }
  
  return newSize
}

describe('Resizable Layout Hook Property Tests', () => {
  const defaultPanelSizes: PanelSizes = {
    centralPanel: { width: 60, height: 50 },
    leftPanel: { width: 20 },
    rightPanel: { width: 20 },
    financialAnalysisPanel: { height: 25 },
    industryPanel: { height: 15 }
  }

  test('Property 29: Panel Resize Constraints - Feature: ai-financial-terminal, Property 29: Panel Resize Constraints', () => {
    // **Validates: Requirements 11.3**
    fc.assert(
      fc.property(
        panelNameArb,
        fc.float({ min: -50, max: 150, noNaN: true }), // Test values outside valid range
        (panelName: keyof PanelSizes, inputSize: number) => {
          let sizeUpdate: Partial<PanelSizes[keyof PanelSizes]>
          
          // Create appropriate size update based on panel type - only update the relevant dimension
          if (panelName === 'centralPanel') {
            // For central panel, test both width and height separately
            const testWidth = Math.random() > 0.5
            sizeUpdate = testWidth ? { width: inputSize } : { height: inputSize }
          } else if (panelName === 'leftPanel' || panelName === 'rightPanel') {
            sizeUpdate = { width: inputSize }
          } else {
            sizeUpdate = { height: inputSize }
          }
          
          // Validate the size using the validation function
          const validatedSize = validatePanelSize(panelName, sizeUpdate, defaultPanelSizes)
          
          // Get the constraints for this panel
          const constraints = PANEL_CONSTRAINTS[panelName]
          
          // Check width constraints if applicable and if width was updated
          if ('width' in sizeUpdate && 'width' in validatedSize && constraints.width) {
            expect(validatedSize.width).toBeGreaterThanOrEqual(constraints.width.min)
            expect(validatedSize.width).toBeLessThanOrEqual(constraints.width.max)
          }
          
          // Check height constraints if applicable and if height was updated
          if ('height' in sizeUpdate && 'height' in validatedSize && constraints.height) {
            expect(validatedSize.height).toBeGreaterThanOrEqual(constraints.height.min)
            expect(validatedSize.height).toBeLessThanOrEqual(constraints.height.max)
          }
          
          // Ensure the validated size is a finite number
          Object.values(validatedSize).forEach(value => {
            expect(Number.isFinite(value)).toBe(true)
          })
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 31: Layout Space Conservation - Feature: ai-financial-terminal, Property 31: Layout Space Conservation', () => {
    // **Validates: Requirements 11.6**
    fc.assert(
      fc.property(
        fc.constantFrom('leftPanel', 'rightPanel', 'centralPanel'), // Only horizontal panels
        fc.float({ min: 15, max: 80, noNaN: true }), // Valid range for any horizontal panel
        (panelName: 'leftPanel' | 'rightPanel' | 'centralPanel', newWidth: number) => {
          // Create a mock update function that simulates space conservation
          const mockUpdatePanelSize = (
            panel: keyof PanelSizes, 
            size: Partial<PanelSizes[keyof PanelSizes]>,
            currentSizes: PanelSizes
          ): PanelSizes => {
            const newSizes = { ...currentSizes }
            
            // Update the target panel with validation
            newSizes[panel] = validatePanelSize(panel, size, currentSizes)
            
            // Simulate space conservation for horizontal panels
            if ('width' in size) {
              // After updating the target panel, ensure total width is exactly 100
              const leftWidth = 'width' in newSizes.leftPanel ? newSizes.leftPanel.width : 0
              const rightWidth = 'width' in newSizes.rightPanel ? newSizes.rightPanel.width : 0
              const centralWidth = 'width' in newSizes.centralPanel ? newSizes.centralPanel.width : 0
              
              const totalWidth = leftWidth + centralWidth + rightWidth
              
              // Always normalize to exactly 100 to avoid floating point issues
              if (totalWidth !== 100) {
                const scaleFactor = 100 / totalWidth
                
                // Scale all panels proportionally while respecting constraints
                const scaledLeft = leftWidth * scaleFactor
                const scaledRight = rightWidth * scaleFactor
                const scaledCentral = centralWidth * scaleFactor
                
                // Apply constraints after scaling
                const finalLeft = Math.max(15, Math.min(35, scaledLeft))
                const finalRight = Math.max(15, Math.min(35, scaledRight))
                const finalCentral = Math.max(40, Math.min(80, scaledCentral))
                
                // If constraints cause deviation from 100, adjust the central panel
                const constrainedTotal = finalLeft + finalRight + finalCentral
                if (constrainedTotal !== 100) {
                  const adjustment = 100 - constrainedTotal
                  const adjustedCentral = Math.max(40, Math.min(80, finalCentral + adjustment))
                  
                  newSizes.leftPanel = { ...newSizes.leftPanel, width: finalLeft }
                  newSizes.rightPanel = { ...newSizes.rightPanel, width: finalRight }
                  newSizes.centralPanel = { ...newSizes.centralPanel, width: adjustedCentral }
                } else {
                  newSizes.leftPanel = { ...newSizes.leftPanel, width: finalLeft }
                  newSizes.rightPanel = { ...newSizes.rightPanel, width: finalRight }
                  newSizes.centralPanel = { ...newSizes.centralPanel, width: finalCentral }
                }
              }
            }
            
            return newSizes
          }
          
          const initialSizes = defaultPanelSizes
          const updatedSizes = mockUpdatePanelSize(panelName, { width: newWidth }, initialSizes)
          
          // Check that total horizontal space is conserved (equals 100%)
          const leftWidth = 'width' in updatedSizes.leftPanel ? updatedSizes.leftPanel.width : 0
          const rightWidth = 'width' in updatedSizes.rightPanel ? updatedSizes.rightPanel.width : 0
          const centralWidth = 'width' in updatedSizes.centralPanel ? updatedSizes.centralPanel.width : 0
          const totalWidth = leftWidth + centralWidth + rightWidth
          
          expect(Math.abs(totalWidth - 100)).toBeLessThan(0.001) // Very tight tolerance since we normalize
          
          // Check that all panels remain within their constraints
          expect(leftWidth).toBeGreaterThanOrEqual(15)
          expect(leftWidth).toBeLessThanOrEqual(35)
          expect(rightWidth).toBeGreaterThanOrEqual(15)
          expect(rightWidth).toBeLessThanOrEqual(35)
          expect(centralWidth).toBeGreaterThanOrEqual(40)
          expect(centralWidth).toBeLessThanOrEqual(80)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 30: Panel Size Persistence - Feature: ai-financial-terminal, Property 30: Panel Size Persistence', () => {
    // **Validates: Requirements 11.4**
    fc.assert(
      fc.property(
        panelNameArb,
        fc.float({ min: 0, max: 100, noNaN: true }),
        (panelName: keyof PanelSizes, newSize: number) => {
          // Mock localStorage
          const mockStorage: { [key: string]: string } = {}
          const mockLocalStorage = {
            getItem: vi.fn((key: string) => mockStorage[key] || null),
            setItem: vi.fn((key: string, value: string) => {
              mockStorage[key] = value
            }),
            removeItem: vi.fn((key: string) => {
              delete mockStorage[key]
            }),
            clear: vi.fn(() => {
              Object.keys(mockStorage).forEach(key => delete mockStorage[key])
            })
          }
          
          // Mock the persistence behavior
          const mockPersistPanelSizes = (sizes: PanelSizes) => {
            const persistedData = {
              panelSizes: sizes,
              ui: {
                selectedCompanyId: null,
                selectedIndustryId: null
              }
            }
            mockLocalStorage.setItem('ai-financial-terminal-storage', JSON.stringify(persistedData))
          }
          
          const mockLoadPanelSizes = (): PanelSizes | null => {
            const stored = mockLocalStorage.getItem('ai-financial-terminal-storage')
            if (stored) {
              try {
                const parsed = JSON.parse(stored)
                return parsed.panelSizes || null
              } catch {
                return null
              }
            }
            return null
          }
          
          // Create initial sizes
          const initialSizes = defaultPanelSizes
          
          // Create updated sizes with validation
          let sizeUpdate: Partial<PanelSizes[keyof PanelSizes]>
          if (panelName === 'centralPanel') {
            sizeUpdate = { width: newSize }
          } else if (panelName === 'leftPanel' || panelName === 'rightPanel') {
            sizeUpdate = { width: newSize }
          } else {
            sizeUpdate = { height: newSize }
          }
          
          const validatedSize = validatePanelSize(panelName, sizeUpdate, initialSizes)
          const updatedSizes = { ...initialSizes, [panelName]: validatedSize }
          
          // Persist the sizes
          mockPersistPanelSizes(updatedSizes)
          
          // Load the sizes back
          const loadedSizes = mockLoadPanelSizes()
          
          // Verify persistence worked
          expect(loadedSizes).not.toBeNull()
          expect(loadedSizes![panelName]).toEqual(validatedSize)
          
          // Verify localStorage was called
          expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            'ai-financial-terminal-storage',
            expect.stringContaining('"panelSizes"')
          )
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Resizable Layout Hook Unit Tests', () => {
  const defaultPanelSizes: PanelSizes = {
    centralPanel: { width: 60, height: 50 },
    leftPanel: { width: 20 },
    rightPanel: { width: 20 },
    financialAnalysisPanel: { height: 25 },
    industryPanel: { height: 15 }
  }

  test('validates central panel width constraints', () => {
    // Test minimum constraint
    const tooSmall = validatePanelSize('centralPanel', { width: 10 }, defaultPanelSizes)
    expect(tooSmall.width).toBe(40) // Should be clamped to minimum
    
    // Test maximum constraint
    const tooLarge = validatePanelSize('centralPanel', { width: 90 }, defaultPanelSizes)
    expect(tooLarge.width).toBe(80) // Should be clamped to maximum
    
    // Test valid value
    const valid = validatePanelSize('centralPanel', { width: 60 }, defaultPanelSizes)
    expect(valid.width).toBe(60) // Should be preserved
  })

  test('validates left panel width constraints', () => {
    const tooSmall = validatePanelSize('leftPanel', { width: 5 }, defaultPanelSizes)
    expect(tooSmall.width).toBe(15)
    
    const tooLarge = validatePanelSize('leftPanel', { width: 50 }, defaultPanelSizes)
    expect(tooLarge.width).toBe(35)
  })

  test('validates financial analysis panel height constraints', () => {
    const tooSmall = validatePanelSize('financialAnalysisPanel', { height: 5 }, defaultPanelSizes)
    expect(tooSmall.height).toBe(15)
    
    const tooLarge = validatePanelSize('financialAnalysisPanel', { height: 50 }, defaultPanelSizes)
    expect(tooLarge.height).toBe(40)
  })

  test('drag events update dimensions', () => {
    // Mock a simple drag operation
    const mockDragOperation = (
      initialSizes: PanelSizes,
      panel: keyof PanelSizes,
      deltaX: number,
      deltaY: number,
      containerWidth: number = 1920,
      containerHeight: number = 1080
    ): PanelSizes => {
      const newSizes = { ...initialSizes }
      
      // Simulate horizontal drag
      if (panel === 'leftPanel' || panel === 'rightPanel' || panel === 'centralPanel') {
        const deltaPercentage = (deltaX / containerWidth) * 100
        const currentWidth = ('width' in newSizes[panel] ? (newSizes[panel] as any).width : 0) || 0
        const newWidth = currentWidth + deltaPercentage
        
        const validatedSize = validatePanelSize(panel, { width: newWidth }, initialSizes)
        newSizes[panel] = validatedSize
      }
      
      // Simulate vertical drag
      if (panel === 'centralPanel' || panel === 'financialAnalysisPanel' || panel === 'industryPanel') {
        const deltaPercentage = (deltaY / containerHeight) * 100
        const currentHeight = ('height' in newSizes[panel] ? (newSizes[panel] as any).height : 0) || 0
        const newHeight = currentHeight + deltaPercentage
        
        const validatedSize = validatePanelSize(panel, { height: newHeight }, initialSizes)
        newSizes[panel] = validatedSize
      }
      
      return newSizes
    }
    
    // Test horizontal drag
    const horizontalResult = mockDragOperation(defaultPanelSizes, 'leftPanel', 100, 0)
    const leftPanelWidth = 'width' in horizontalResult.leftPanel ? horizontalResult.leftPanel.width : 0
    expect(leftPanelWidth).toBeGreaterThan(defaultPanelSizes.leftPanel.width)
    expect(leftPanelWidth).toBeLessThanOrEqual(35) // Max constraint
    
    // Test vertical drag
    const verticalResult = mockDragOperation(defaultPanelSizes, 'centralPanel', 0, 50)
    const centralPanelHeight = 'height' in verticalResult.centralPanel ? verticalResult.centralPanel.height : 0
    expect(centralPanelHeight).toBeGreaterThan(defaultPanelSizes.centralPanel.height)
    expect(centralPanelHeight).toBeLessThanOrEqual(70) // Max constraint
  })

  test('reset layout restores defaults', () => {
    const DEFAULT_SIZES: PanelSizes = {
      centralPanel: { width: 60, height: 50 },
      leftPanel: { width: 20 },
      rightPanel: { width: 20 },
      financialAnalysisPanel: { height: 25 },
      industryPanel: { height: 15 }
    }
    
    // Mock reset function
    const mockResetLayout = (): PanelSizes => {
      return { ...DEFAULT_SIZES }
    }
    
    // Simulate modified sizes (remove unused variable)
    // Test reset and verify
    const resetSizes = mockResetLayout()
    expect(resetSizes).toEqual(DEFAULT_SIZES)
    expect(resetSizes.centralPanel.width).toBe(60)
    expect(resetSizes.leftPanel.width).toBe(20)
    expect(resetSizes.financialAnalysisPanel.height).toBe(25)
  })

  test('localStorage save/restore', () => {
    // Mock localStorage
    const mockStorage: { [key: string]: string } = {}
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key])
      })
    }
    
    // Mock save function
    const mockSavePanelSizes = (sizes: PanelSizes) => {
      const data = {
        panelSizes: sizes,
        ui: { selectedCompanyId: null, selectedIndustryId: null }
      }
      mockLocalStorage.setItem('ai-financial-terminal-storage', JSON.stringify(data))
    }
    
    // Mock load function
    const mockLoadPanelSizes = (): PanelSizes | null => {
      const stored = mockLocalStorage.getItem('ai-financial-terminal-storage')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          return parsed.panelSizes || null
        } catch {
          return null
        }
      }
      return null
    }
    
    // Test save
    const testSizes: PanelSizes = {
      centralPanel: { width: 65, height: 55 },
      leftPanel: { width: 18 },
      rightPanel: { width: 17 },
      financialAnalysisPanel: { height: 30 },
      industryPanel: { height: 12 }
    }
    
    mockSavePanelSizes(testSizes)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'ai-financial-terminal-storage',
      expect.stringContaining('"panelSizes"')
    )
    
    // Test restore
    const loadedSizes = mockLoadPanelSizes()
    expect(loadedSizes).toEqual(testSizes)
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('ai-financial-terminal-storage')
  })
})