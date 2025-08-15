import { Plugin, MarkdownPostProcessorContext, WorkspaceLeaf } from 'obsidian';

export default class InteractiveCheckboxPlugin extends Plugin {
	private checkboxProcessor!: (element: HTMLElement, context: MarkdownPostProcessorContext) => void;
	private livePreviewExtensions: any[] = [];

	async onload() {
		console.log('Loading Interactive Checkbox Plugin');

		// Create the checkbox processor function for reading mode
		this.checkboxProcessor = (element: HTMLElement, context: MarkdownPostProcessorContext) => {
			this.processReadingMode(element, context);
		};

		// Register markdown post-processor for reading mode
		this.registerMarkdownPostProcessor(this.checkboxProcessor);

		// Set up CodeMirror extensions for live preview mode
		this.setupLivePreviewMode();

		// Add CSS styles
		this.addStyles();
	}

	onunload() {
		console.log('Unloading Interactive Checkbox Plugin');
	}

	private processReadingMode(element: HTMLElement, context: MarkdownPostProcessorContext) {
		// Find all text nodes that contain checkbox patterns
		const walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: (node: Node) => {
					const text = node.textContent || '';
					// Look for checkbox patterns not already processed
					if (/\[[ xX]\]/.test(text) && !this.isInCodeBlock(node) && !this.isInLink(node)) {
						return NodeFilter.FILTER_ACCEPT;
					}
					return NodeFilter.FILTER_REJECT;
				}
			}
		);

		const textNodes: Text[] = [];
		let node: Node | null;
		while (node = walker.nextNode()) {
			textNodes.push(node as Text);
		}

		// Process each text node containing checkboxes
		textNodes.forEach(textNode => {
			this.processTextNodeCheckboxes(textNode, context);
		});
	}

	private processTextNodeCheckboxes(textNode: Text, context: MarkdownPostProcessorContext) {
		const text = textNode.textContent || '';
		const checkboxRegex = /\[[ xX]\]/g;
		let match;
		const replacements: { index: number, length: number, isChecked: boolean }[] = [];

		// Find all checkbox patterns in this text node first
		while ((match = checkboxRegex.exec(text))) {
			const index = match.index;
			const pattern = match[0];
			const isChecked = /[xX]/.test(pattern);

			// Check if this is followed by ( to avoid link syntax like [x](url)
			const nextChar = text[index + pattern.length];
			if (nextChar === '(') {
				continue;
			}

			replacements.push({
				index,
				length: pattern.length,
				isChecked
			});
		}

		// Process replacements in reverse order to maintain indices
		// but only if we found any replacements
		if (replacements.length > 0) {
			this.replaceAllCheckboxesInTextNode(textNode, replacements.reverse(), context);
		}
	}

	private replaceAllCheckboxesInTextNode(
		textNode: Text,
		replacements: { index: number, length: number, isChecked: boolean }[],
		context: MarkdownPostProcessorContext
	) {
		if (!textNode.parentNode || replacements.length === 0) {
			return;
		}

		const originalText = textNode.textContent || '';
		const parent = textNode.parentNode;
		const nextSibling = textNode.nextSibling;
		
		// Build the replacement elements in order
		const elements: (Text | HTMLInputElement)[] = [];
		let lastIndex = 0;

		// Process replacements in forward order (they should already be sorted in reverse)
		replacements.reverse().forEach(replacement => {
			const { index, length, isChecked } = replacement;
			
			// Add text before this checkbox
			if (index > lastIndex) {
				const textBefore = originalText.substring(lastIndex, index);
				if (textBefore) {
					elements.push(document.createTextNode(textBefore));
				}
			}

			// Create the checkbox element
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = isChecked;
			checkbox.className = 'inline-cb';

			// Add click handler
			checkbox.addEventListener('click', (e) => {
				e.preventDefault();
				this.handleCheckboxToggle(checkbox, context);
			});

			elements.push(checkbox);
			lastIndex = index + length;
		});

		// Add remaining text after the last checkbox
		if (lastIndex < originalText.length) {
			const remainingText = originalText.substring(lastIndex);
			if (remainingText) {
				elements.push(document.createTextNode(remainingText));
			}
		}

		// Remove the original text node
		parent.removeChild(textNode);

		// Insert all new elements
		elements.forEach(element => {
			if (nextSibling) {
				parent.insertBefore(element, nextSibling);
			} else {
				parent.appendChild(element);
			}
		});
	}

	private replaceCheckboxInTextNode(
		textNode: Text, 
		replacement: { index: number, length: number, isChecked: boolean },
		context: MarkdownPostProcessorContext
	) {
		const { index, length, isChecked } = replacement;

		// Check if textNode is still in the DOM (previous replacements might have removed it)
		if (!textNode.parentNode) {
			return;
		}

		// Get the current text content (might have changed from previous replacements)
		const currentText = textNode.textContent || '';
		if (index >= currentText.length) {
			return; // Index is beyond current text length
		}

		// Create the checkbox element
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = isChecked;
		checkbox.className = 'inline-cb';

		// Add click handler
		checkbox.addEventListener('click', (e) => {
			e.preventDefault();
			this.handleCheckboxToggle(checkbox, context);
		});

		// Split the text node and insert the checkbox
		const beforeText = currentText.substring(0, index);
		const afterText = currentText.substring(index + length);

		// Create new text nodes
		const beforeNode = document.createTextNode(beforeText);
		const afterNode = document.createTextNode(afterText);

		// Insert the new nodes
		textNode.parentNode.insertBefore(beforeNode, textNode);
		textNode.parentNode.insertBefore(checkbox, textNode);
		textNode.parentNode.insertBefore(afterNode, textNode);

		// Remove the original text node
		textNode.parentNode.removeChild(textNode);
	}

	private async handleCheckboxToggle(checkbox: HTMLInputElement, context: MarkdownPostProcessorContext) {
		const newState = checkbox.checked;
		const file = this.app.vault.getAbstractFileByPath(context.sourcePath);

		if (!file || file.path !== context.sourcePath) {
			console.warn('File not found for checkbox toggle');
			return;
		}

		try {
			const content = await this.app.vault.read(file);
			const lines = content.split('\n');
			
			// Find and update the checkbox in the file content
			const sectionInfo = context.getSectionInfo(checkbox);
			if (sectionInfo) {
				const lineIndex = sectionInfo.lineStart;
				if (lineIndex < lines.length) {
					const line = lines[lineIndex];
					const newPattern = newState ? '[x]' : '[ ]';
					const updatedLine = line.replace(/\[[ xX]\]/, newPattern);
					lines[lineIndex] = updatedLine;

					const newContent = lines.join('\n');
					await this.app.vault.modify(file, newContent);
				}
			}
		} catch (error) {
			console.error('Error updating checkbox state:', error);
			// Revert checkbox state on error
			checkbox.checked = !newState;
		}
	}

	private isInCodeBlock(node: Node): boolean {
		let current = node.parentElement;
		while (current) {
			if (  current.tagName === 'CODE' || 
            current.tagName === 'PRE' || 
            current.classList.contains('cm-inline-code') ||
            current.classList.contains('HyperMD-codeblock')
          ) 
      {
				return true;
			}
			current = current.parentElement;
		}
		return false;
	}

	private isInLink(node: Node): boolean {
		let parent = node.parentElement;
		while (parent) {
			if (parent.tagName === 'A') {
				return true;
			}
			parent = parent.parentElement;
		}
		return false;
	}

	private detectCurrentMode(): string | null {
		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf) return null;

		const viewState = activeLeaf.getViewState();
		if (!viewState || viewState.type !== 'markdown') return null;

		// Check the view state for mode information according to API docs
		if (viewState.state?.mode === 'preview') {
			return 'reading';
		} else if (viewState.state?.source == false) {
			return 'live-preview';
		} else if (viewState.state?.source) {
			return 'source';
		}

		return null;
	}

	private setupLivePreviewMode() {
		try {
			// @ts-ignore - Access CodeMirror classes through Obsidian's require
			const { EditorView, Decoration, WidgetType } = require('@codemirror/view');
			// @ts-ignore
			const { StateField, RangeSetBuilder } = require('@codemirror/state');
			// @ts-ignore
			const { syntaxTree } = require('@codemirror/language');
			
			if (!Decoration || !WidgetType || !RangeSetBuilder || !StateField) {
				console.warn("CodeMirror APIs not fully available.");
				return;
			}

			// Define the widget class
			class CheckboxWidget extends WidgetType {
				checked: boolean;
				from: number;
				to: number;

				constructor(checked: boolean, from: number, to: number) {
					super();
					this.checked = checked;
					this.from = from;
					this.to = to;
				}

				toDOM(view: any): HTMLElement {
					const box = document.createElement("input");
					box.type = "checkbox";
					box.className = "inline-cb cm-inline-cb";
					box.checked = this.checked;
					
					box.addEventListener("mousedown", (e) => e.preventDefault());
					box.addEventListener("click", (e) => {
						e.preventDefault();
						const newText = this.checked ? "[ ]" : "[x]";
						const tr = view.state.update({
							changes: { from: this.from, to: this.to, insert: newText }
						});
						view.dispatch(tr);
					});
					
					return box;
				}

				ignoreEvent(): boolean { 
					return false; 
				}

				coordsAt(dom: HTMLElement): DOMRect {
					return dom.getBoundingClientRect();
				}
			}

			const plugin = this;
			let lastMode = this.detectCurrentMode();
			
			const checkboxField = StateField.define({
				create(state: any) {
					const currentMode = plugin.detectCurrentMode();
					if (currentMode === 'live-preview') {
						return plugin.createCheckboxDecorations(state, null, CheckboxWidget, Decoration, RangeSetBuilder, syntaxTree);
					}
					return new RangeSetBuilder().finish();
				},
				update(deco: any, tr: any) {
					const currentMode = plugin.detectCurrentMode();
					
					// If mode changed from live-preview to something else, clear decorations
					if (lastMode === 'live-preview' && currentMode !== 'live-preview') {
						lastMode = currentMode;
						return new RangeSetBuilder().finish();
					}
					
					// If mode changed to live-preview, create decorations
					if (lastMode !== 'live-preview' && currentMode === 'live-preview') {
						lastMode = currentMode;
						return plugin.createCheckboxDecorations(tr.state, tr.selection, CheckboxWidget, Decoration, RangeSetBuilder, syntaxTree);
					}
					
					// Normal updates when in live-preview mode
					if (currentMode === 'live-preview' && (tr.docChanged || tr.selection)) {
						return plugin.createCheckboxDecorations(tr.state, tr.selection, CheckboxWidget, Decoration, RangeSetBuilder, syntaxTree);
					}
					
					lastMode = currentMode;
					return deco.map(tr.changes);
				},
				provide: (f: any) => EditorView.decorations.from(f)
			});

			// Register the extension with CodeMirror via the registerEditorExtension method
			// @ts-ignore - This method exists but may not be in all type definitions
			this.registerEditorExtension([checkboxField]);
			this.livePreviewExtensions = [checkboxField];

		} catch (error) {
			console.warn("CodeMirror 6 APIs not available in this Obsidian version:", error);
		}
	}

	private createCheckboxDecorations(state: any, selection: any, CheckboxWidget: any, Decoration: any, RangeSetBuilder: any, syntaxTree: any) {
		try {
			const builder = new RangeSetBuilder();
			const text = state.doc.toString();
			const re = /\[[ xX]\]/g;
			let match;
			
			// Get cursor position if available
			const cursorPos = selection ? selection.main.head : -1;
			
			// Get syntax tree for the current state
			const tree = syntaxTree(state);
			
			// Helper function to check if a position is inside a code block
			const isInCodeBlock = (pos: number): boolean => {
				let isInCode = false;
				tree.iterate({
					from: pos,
					to: pos,
					enter: (node: any) => {
						if (node.type.name === "inline-code" || node.type.name?.includes("codeblock")) {
							isInCode = true;
						}
					}
				});
				return isInCode;
			};
			
			while ((match = re.exec(text))) {
				const from = match.index;
				const to = from + match[0].length;
				const isChecked = /[xX]/.test(match[0]);
				
				// Only proceed if it's not followed by ( to avoid link syntax
				const nextChar = text[to];
				if (nextChar === '(') {
					continue;
				}

				// Skip conversion if cursor is inside or immediately after this checkbox pattern
				if (cursorPos >= from && cursorPos <= to + 1) {
					continue;
				}

				// Skip if the checkbox is inside a code block
				if (isInCodeBlock(from)) {
					continue;
				}
				
				console.log(`Adding checkbox decoration: "${match[0]}" at ${from}-${to}`);
				builder.add(from, to, Decoration.replace({
					widget: new CheckboxWidget(isChecked, from, to)
				}));
			}
			
			return builder.finish();
		} catch (error) {
			console.warn("Could not create checkbox decorations:", error);
			return null;
		}
	}

	private addStyles() {
		// Add CSS for checkbox styling
		const style = document.createElement('style');
		style.textContent = `
			.inline-cb {
				cursor: pointer;
				margin: 0 2px;
				vertical-align: middle;
			}
			
			.cm-inline-cb {
				cursor: pointer;
				margin: 0 2px;
				vertical-align: middle;
			}
		`;
		document.head.appendChild(style);
	}
}
