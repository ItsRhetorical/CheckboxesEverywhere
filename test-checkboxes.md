# Interactive Checkbox Plugin Test

This file demonstrates the Interactive Checkbox Plugin functionality across **all Obsidian view modes**.

## Mode Support Status

✅ **Reading Mode**: Fully supported with markdown post-processor  
✅ **Live Preview Mode**: Supported with DOM observation and manipulation  
❌ **Source Mode**: Explicitly disabled (shows raw markdown as intended)

## Basic Checkboxes

Here are some basic checkbox patterns:
- Empty checkbox: [ ] This should become interactive
- Checked checkbox: [x] This should be checked
- Also checked: [X] This should also be checked

## Inline Checkboxes

Checkboxes can appear anywhere in text[ ]like this one[ ]or even multiple[x]in the same line.

## Mixed Content

Some text with[ ]checkboxes mixed in[x]between words and at the end[ ].

## Edge Cases

This should NOT be processed (it's a link): [Link Text](https://example.com)

Code blocks should be ignored:
```
[ ] This checkbox should not be interactive
[x] Neither should this one
```

Inline code `[ ]` should also be ignored.

## Task Lists (Native Obsidian)

These should be left alone by the plugin:
- [ ] Native task list item
- [x] Completed native task

## Complex Examples

Start[ ]middle[x]end
Multiple[ ]checkboxes[ ]in[ ]one[X]line[ ]

## Testing Instructions

1. **Reading Mode**: Switch to Reading Mode (Ctrl+E) - checkboxes should be interactive
2. **Live Preview Mode**: Switch to Live Preview Mode - checkboxes should still be interactive
3. **Source Mode**: Switch to Source Mode (Ctrl+E twice) - checkboxes should remain as plain text

## Mode-Specific Behavior

- **Reading Mode**: Uses `.inline-cb` CSS class
- **Live Preview**: Uses `.inline-cb-live` CSS class with DOM observation
- **Source Mode**: No processing (raw markdown visible)
