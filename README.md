# Checkbox Everywhere Plugin

Transform your markdown checkboxes into interactive, clickable elements across all Obsidian view modes. This plugin converts `[ ]` and `[x]` syntax into HTML checkboxes that persist their state when clicked.

## Installation

### Manual Installation
1. Download the latest release files
2. Create a folder: `YourVault/.obsidian/plugins/checkboxes-everywhere/`
3. Copy the files to this folder
4. Enable the plugin in Obsidian Settings → Community Plugins

### Building from Source
```bash
git clone https://github.com/ItsRhetorical/CheckboxesEverywhere.git
cd CheckboxesEverywhere
npm install
npm run build
```

## Usage

Simply write checkboxes in your markdown using the standard syntax:

 `[ ]` - Creates an unchecked checkbox
 `[x]` or `[X]` - Creates a checked checkbox
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


![Example](https://github.com/ItsRhetorical/CheckboxesEverywhere/blob/main/ReadmeScreenshot.jpg?raw=true)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
