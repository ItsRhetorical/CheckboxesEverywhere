# Interactive Checkbox Plugin

Transform your markdown checkboxes into interactive, clickable elements across **all Obsidian view modes**. This plugin converts `[ ]` and `[x]` syntax into HTML checkboxes that persist their state when clicked.

## ✅ Complete Multi-Mode Support

- **✅ Reading Mode**: Seamless functionality using markdown post-processor
- **✅ Live Preview Mode**: Interactive checkboxes with DOM observation  
- **❌ Source Mode**: Explicitly disabled (shows raw markdown as intended)

## Features

- **Universal Checkbox Rendering**: Converts `[ ]`, `[x]`, and `[X]` patterns to interactive HTML checkboxes
- **Multi-Mode Support**: Works in both Reading Mode and Live Preview Mode  
- **Persistent State Management**: Checkbox state changes immediately update the underlying markdown file
- **Context-Aware Processing**: Intelligent detection that avoids code blocks, inline code, and links
- **Performance Optimized**: Minimal impact on Obsidian's rendering performance
- **Mode Detection**: Automatically switches behavior based on current view mode

## Installation

### Manual Installation
1. Download the latest release files (`main.js`, `manifest.json`)
2. Create a folder: `YourVault/.obsidian/plugins/interactive-checkbox-plugin/`
3. Copy the files to this folder
4. Enable the plugin in Obsidian Settings → Community Plugins

### Building from Source
```bash
git clone https://github.com/your-username/obsidian-interactive-checkbox-plugin.git
cd obsidian-interactive-checkbox-plugin
npm install
npm run build
```

## Usage

Simply write checkboxes in your markdown using the standard syntax:

- `[ ]` - Creates an unchecked interactive checkbox
- `[x]` or `[X]` - Creates a checked interactive checkbox

### Example Patterns

The plugin handles various checkbox patterns:

```markdown
# Basic Usage
[ ] Simple checkbox
[x] Checked checkbox
[ ] [ ] Multiple checkboxes
Text before [ ] checkbox after text

# In Lists (preserves formatting)
- Text with checkbox [ ]
- Another item [ ] with text after
1. Numbered list [ ]
2. With checkboxes [ ] inline

# Quote Blocks
> Quoted text with [ ] checkbox
```


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
