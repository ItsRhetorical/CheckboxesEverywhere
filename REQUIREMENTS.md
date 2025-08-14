# Interactive Checkbox Plugin for Obsidian - Requirements Document

## **Project Overview**

The Interactive Checkbox Plugin transforms static markdown checkbox syntax (`[ ]`, `[x]`, `[X]`) into interactive HTML checkbox elements across all Obsidian view modes, with persistent state management that directly updates the underlying markdown files.

## **Goals & Objectives**

### **Primary Goals**
1. **Universal Checkbox Rendering**: Convert `[ ]`, `[x]`, and `[X]` patterns to interactive HTML checkboxes in all contexts
2. **Cross-Mode Compatibility**: Seamless functionality across Reading Mode, Live Preview, and Source Mode
3. **Persistent State Management**: Checkbox state changes immediately update the underlying markdown file
4. **Context-Aware Processing**: Intelligent detection that avoids code blocks, inline code, and links
5. **Performance Optimization**: Minimal impact on Obsidian's rendering performance

### **Secondary Goals**
1. **Visual Consistency**: Checkboxes maintain consistent styling across all modes
2. **User Experience**: Immediate visual feedback with reliable state persistence
3. **Error Resilience**: Graceful handling of edge cases and parsing failures

## **Core Requirements**

### **Functional Requirements**

#### **F1: Checkbox Pattern Recognition**
- **F1.1**: Detect `[ ]` (unchecked), `[x]` (checked), `[X]` (checked) patterns anywhere in text
- **F1.2**: Support checkboxes in any text context (beginning, middle, end of lines)
- **F1.3**: Handle multiple checkboxes on the same line
- **F1.4**: Process checkboxes embedded within regular text content

#### **F2: Multi-Mode Support**
- **F2.1**: **Reading Mode**: Use Markdown Post-Processor for DOM manipulation
- **F2.2**: **Live Preview Mode**: Use CodeMirror StateField with decorations
- **F2.3**: **Source Mode**: Explicitly disabled (show raw markdown)
- **F2.4**: **Mode Detection**: Automatic detection and switching between processing methods

#### **F3: State Management**
- **F3.1**: Click events toggle checkbox state in UI immediately
- **F3.2**: State changes trigger file modification with exact position matching
- **F3.3**: Context-based position resolution using surrounding text hints
- **F3.4**: Prevent recursive processing during file updates

#### **F4: Context Filtering**
- **F4.1**: **Code Block Exclusion**: Skip checkboxes inside `code` blocks and `pre` elements
- **F4.2**: **Inline Code Exclusion**: Skip checkboxes inside inline `code` spans
- **F4.3**: **Link Exclusion**: Skip patterns that are part of markdown links `[text](url)`
- **F4.4**: **Native Task Lists**: Distinguish from Obsidian's native task list checkboxes

## **Edge Cases & Constraints**

### **Edge Case 1: Complex Text Patterns**
- **Scenario**: `text[ ]more[ ]text[x]end`
- **Requirement**: All checkboxes must be individually interactive
- **Solution**: Universal regex matching with precise position tracking

### **Edge Case 2: Code Context Detection**
- **Scenario**: Checkboxes in markdown code blocks or inline code
- **Requirement**: Must be excluded from processing
- **Solution**: DOM tree traversal and CSS class inspection

### **Edge Case 3: Link Syntax Conflicts**
- **Scenario**: `[Link Text](url)` vs `[x] checkbox`
- **Requirement**: Avoid false positives in link syntax
- **Solution**: Next-character analysis for `(` or `](`

### **Edge Case 4: DOM Modification During Traversal**
- **Scenario**: TreeWalker iteration breaking when DOM changes
- **Requirement**: Process all checkboxes in a text block
- **Solution**: Pre-collect text nodes before processing

### **Edge Case 5: Position Resolution Failures**
- **Scenario**: Unable to map UI checkbox to file position
- **Requirement**: Graceful degradation without data loss
- **Solution**: Visual-only toggle with user feedback

### **Edge Case 6: Native Task List Conflicts**
- **Scenario**: Obsidian's built-in `- [ ] task` syntax
- **Requirement**: Avoid duplicate processing
- **Solution**: List context detection and exclusion

## **High-Level Code Architecture**

### **Core Components**

#### **C1: Plugin Main Class (`InlineCheckboxPlugin`)**
```typescript
export default class InlineCheckboxPlugin extends Plugin {
  // State management
  private isUpdating: boolean
  private lastSourceMode: boolean | undefined
  private mutationObserver: MutationObserver | null
  
  // Core methods
  async onload()
  onunload()
  private onClick(evt: MouseEvent)
}
```

#### **C2: Mode Detection System**
```typescript
// Real-time mode monitoring
private startModeObserver()
private checkModeChange()
private triggerEditorUpdate()
```

#### **C3: Reading Mode Processor**
```typescript
// Markdown Post-Processor for reading mode
private process(root: HTMLElement, ctx: MarkdownPostProcessorContext)
// Features:
// - TreeWalker for text node traversal
// - Document fragment construction
// - Context-aware filtering
// - Position tracking with hints
```

#### **C4: Live Preview Processor**
```typescript
// CodeMirror StateField for live preview
private inlineCheckboxCM6()
private createCheckboxDecorations(state: any, selection: any)
// Features:
// - StateField with decoration system
// - DOM position mapping
// - Cursor-aware processing
// - Real-time updates
```

#### **C5: State Persistence Engine**
```typescript
// File modification with position resolution
private async onClick(evt: MouseEvent)
// Features:
// - Context-based position matching
// - Before/after text hints
// - Safe file modification
// - Error handling and fallbacks
```

### **Technical Implementation Points**

#### **T1: Regex Pattern Engine**
```typescript
const INLINE_CB = /\[( |[xX])\]/g;
// Universal matching for any text context
// Captures checkbox content for state detection
```

#### **T2: Dual Processing Architecture**
- **Reading Mode**: DOM manipulation via markdown post-processor
- **Live Preview**: CodeMirror decorations via StateField
- **Source Mode**: Explicitly disabled
- **Mode Switching**: MutationObserver for seamless transitions

#### **T5: Performance Optimizations**
- Pre-collection of text nodes to avoid DOM traversal issues
- Efficient regex execution with proper `lastIndex` management
- Minimal DOM queries with targeted CSS class checks
- Early exit conditions for non-applicable contexts

### **Integration Points**

#### **I1: Obsidian Plugin API**
- `registerMarkdownPostProcessor()` for reading mode
- `registerEditorExtension()` for live preview
- `registerDomEvent()` for click handling
- Vault file modification API

#### **I2: CodeMirror 6 Integration**
- StateField for decoration management
- WidgetType for checkbox rendering
- Transaction system for content updates
- DOM position mapping utilities

#### **I3: CSS Styling System**
```css
.inline-cb, .cm-inline-cb {
  /* Consistent checkbox styling across modes */
  width: 1em; height: 1em;
  vertical-align: text-bottom;
  /* ... */
}
```

## **Success Criteria**

### **Primary Success Metrics**
1. **Coverage**: 100% of valid checkbox patterns converted across all modes
2. **Reliability**: State changes persist correctly in 99%+ of cases
3. **Performance**: No perceptible impact on document rendering speed
4. **Context Accuracy**: Zero false positives in code/link contexts

### **User Experience Metrics**
1. **Immediacy**: Visual state changes appear instantly on click
2. **Persistence**: File modifications complete within 100ms
3. **Consistency**: Identical behavior across all Obsidian view modes
4. **Error Handling**: Graceful degradation with user feedback

This requirements document establishes the foundation for a robust, universal checkbox plugin that enhances Obsidian's markdown editing experience while maintaining data integrity and performance standards.
