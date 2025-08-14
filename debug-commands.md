# Debug Commands for Obsidian View Mode Detection

Run these commands in the browser console (F12) while in different modes:

## ContainerEl Mode Detection (Recommended)
```javascript
// Check container element classes
app.workspace.activeLeaf.view.containerEl.className

// Check for source mode class
app.workspace.activeLeaf.view.containerEl.classList.contains('mod-source')

// Check for data attributes
app.workspace.activeLeaf.view.containerEl.dataset

// Check for source mode in editor
app.workspace.activeLeaf.view.containerEl.querySelector('.cm-editor.is-source')

// Check all child elements with mode indicators
app.workspace.activeLeaf.view.containerEl.querySelectorAll('[class*="source"], [class*="preview"], [class*="live"]')
```

## Basic Workspace Inspection
```javascript
// Get the active view
app.workspace.getActiveViewOfType(app.viewRegistry.typeByName.markdown)

// Get active leaf
app.workspace.activeLeaf

// Check active leaf view
app.workspace.activeLeaf.view

// Check the view's mode property
app.workspace.activeLeaf.view.currentMode

// Check for mode-related properties
console.log(Object.keys(app.workspace.activeLeaf.view))
```

## Editor Mode Detection
```javascript
// Check editor state
app.workspace.activeLeaf.view.editor

// Check source mode property
app.workspace.activeLeaf.view.sourceMode

// Check preview mode property  
app.workspace.activeLeaf.view.previewMode

// Check view state
app.workspace.activeLeaf.view.getState()

// Check view mode directly
app.workspace.activeLeaf.view.getMode()
```

## Alternative Methods
```javascript
// Check for edit vs read mode
app.workspace.activeLeaf.view.getViewType()

// Check editor container classes
document.querySelector('.workspace-leaf.mod-active .cm-editor')?.className

// Check view container attributes
document.querySelector('.workspace-leaf.mod-active .view-content')?.dataset

// Check for mode indicators
app.workspace.activeLeaf.view.editMode
app.workspace.activeLeaf.view.readMode
```

## Deep Inspection
```javascript
// Log all properties of the active view
console.log("Active view properties:", Object.getOwnPropertyNames(app.workspace.activeLeaf.view))

// Check the view's constructor name
console.log("View type:", app.workspace.activeLeaf.view.constructor.name)

// Check if there's a mode property
console.log("Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(app.workspace.activeLeaf.view)))
```

Test these in:
1. **Reading mode** (the eye icon)
2. **Editing mode - Live Preview** (the pencil icon, formatted view)
3. **Editing mode - Source** (the pencil icon, raw markdown)

Look for differences in the output between these modes!
