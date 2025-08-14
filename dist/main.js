"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
/** Matches inline checkboxes with space: [ ] or [x]/[X]
 *  - Must have exactly one space or x/X inside brackets
 *  - Left boundary: start or whitespace or '>' (for blockquotes)
 *  - Not immediately followed b        input.dataset["secStart"] = String(sec.lineStart);
        input.dataset["matchText"] = m[0]; // "[ ]"    if (foundLine === -1) {
      // Couldn't resolve exact position; revert the visual state
      target.checked = !newCheckedState;
      return;
    }

    const current = lines[foundLine].slice(foundCh, foundCh + 3);
    const next = newCheckedState ? "[x]" : "[ ]"; // Match the visual state
    lines[foundLine] = lines[foundLine].slice(0, foundCh) + next + lines[foundLine].slice(foundCh + 3);
        input.dataset["nodeTextBefore"] = text.slice(0, m.index).slice(-50); // last 50 chars before
        input.dataset["nodeTextAfter"]  = text.slice(m.index + m[0].length, m.index + m[0].length + 50); // next 50
        input.dataset["absolutePosition"] = String(m.index); // Store absolute position for better matching'     if (foundLine === -1) {
      //     if (foundLine === -1) {
      // Couldn't resolve exact position; keep the visual state as user clicked
      console.log("Could not find checkbox position in file");
      return;
    }

    const current = lines[foundLine].slice(foundCh, foundCh + 3);
    const next = newCheckedState ? "[x]" : "[ ]"; // Use the visual state user clicked to
    lines[foundLine] = lines[foundLine].slice(0, foundCh) + next + lines[foundLine].slice(foundCh + 3);

    await this.app.vault.modify(file, lines.join("\n"));

    // Update the dataset to reflect new state
    target.dataset["originalState"] = newCheckedState ? "checked" : "unchecked";
    target.dataset["matchText"] = next;
    
    console.log(`File updated successfully, checkbox should be: ${newCheckedState}`);
    
    // Ensure the visual state matches what we intended
    setTimeout(() => {
      target.checked = newCheckedState;
      console.log(`Visual state set to: ${target.checked}`);
    }, 50);

    } catch (error) {
      console.error("Error updating checkbox:", error);
      // Revert visual state on error
      target.checked = !newCheckedState;
    }

    // Don't trigger rerender in reading mode as it will reset the visual state
    // The file update is sufficient for persistence
  }
}act position; keep the visual state as user clicked
      return;
    }

    const current = lines[foundLine].slice(foundCh, foundCh + 3);
    const next = newCheckedState ? "[x]" : "[ ]"; // Use the visual state user clicked to
    lines[foundLine] = lines[foundLine].slice(0, foundCh) + next + lines[foundLine].slice(foundCh + 3);

    await this.app.vault.modify(file, lines.join("\n"));

    // Update the dataset to reflect new state
    target.dataset["originalState"] = newCheckedState ? "checked" : "unchecked";
    target.dataset["matchText"] = next;

    // Don't trigger rerender in reading mode as it will reset the visual state
    // The file update is sufficient for persistence
    // Trigger a rerender so other instances stay in sync
    // const view = this.app.workspace.getActiveViewOfType(MarkdownView) as MarkdownView | null;
    // view?.previewMode.rerender(true);
  }k) collisions
 *  - Right boundary: end or whitespace/punctuation
 *  - This will match "asdf[ ]" and convert just the [ ] part
 */
const INLINE_CB = /\[ \]|\[[xX]\]/g;
class InlineCheckboxPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.isUpdating = false; // Flag to prevent re-rendering during updates
    }
    async onload() {
        this.registerMarkdownPostProcessor((el, ctx) => this.process(el, ctx));
        this.registerDomEvent(document, "click", (evt) => this.onClick(evt));
        this.addStyles();
        // Add CodeMirror extension for edit mode checkboxes
        // @ts-ignore
        if (this.app.workspace?.on) {
            // Obsidian v0.13+ CodeMirror 6
            // @ts-ignore
            this.registerEditorExtension(this.inlineCheckboxCM6());
        }
        else {
            // Obsidian v0.12 CodeMirror 5
            // @ts-ignore
            this.registerCodeMirror((cm) => {
                cm.on("renderLine", (cm, line, elt) => {
                    // Not implemented: CM5 support (Obsidian 0.12 is legacy)
                });
            });
        }
    }
    // CodeMirror 6 extension for inline checkboxes in edit mode
    inlineCheckboxCM6() {
        // Access CodeMirror classes through the global require function in Obsidian
        try {
            // @ts-ignore
            const { EditorView, Decoration, WidgetType } = require('@codemirror/view');
            // @ts-ignore
            const { StateField, RangeSetBuilder } = require('@codemirror/state');
            if (!Decoration || !WidgetType || !RangeSetBuilder || !EditorView || !StateField) {
                console.warn("CodeMirror APIs not fully available.");
                return [];
            }
            class CheckboxWidget extends WidgetType {
                constructor(checked, from, to) {
                    super();
                    this.checked = checked;
                    this.from = from;
                    this.to = to;
                }
                toDOM(view) {
                    const box = document.createElement("input");
                    box.type = "checkbox";
                    box.className = "inline-cb cm-inline-cb";
                    box.checked = this.checked;
                    box.addEventListener("mousedown", (e) => e.preventDefault());
                    box.addEventListener("click", (e) => {
                        // Toggle the markdown text
                        const tr = view.state.update({
                            changes: { from: this.from, to: this.to, insert: this.checked ? "[ ]" : "[x]" }
                        });
                        view.dispatch(tr);
                    });
                    return box;
                }
                // Override to handle cursor positioning
                ignoreEvent() { return false; }
                // Make the widget act as a single character for cursor movement
                coordsAt(dom, pos, side) {
                    return dom.getBoundingClientRect();
                }
            }
            const plugin = this;
            return StateField.define({
                create(state) {
                    return plugin.createCheckboxDecorations(state, null);
                },
                update(deco, tr) {
                    if (tr.docChanged || tr.selection) {
                        return plugin.createCheckboxDecorations(tr.state, tr.selection);
                    }
                    return deco.map(tr.changes);
                },
                provide: (f) => EditorView.decorations.from(f)
            });
        }
        catch (error) {
            console.warn("CodeMirror 6 APIs not available in this Obsidian version:", error);
            return [];
        }
    }
    createCheckboxDecorations(state, selection) {
        try {
            // @ts-ignore
            const { EditorView, Decoration, WidgetType } = require('@codemirror/view');
            // @ts-ignore
            const { StateField, RangeSetBuilder } = require('@codemirror/state');
            const builder = new RangeSetBuilder();
            const text = state.doc.toString();
            const re = INLINE_CB;
            let match;
            re.lastIndex = 0;
            // Get cursor position if available
            const cursorPos = selection ? selection.main.head : -1;
            class CheckboxWidget extends WidgetType {
                constructor(checked, from, to) {
                    super();
                    this.checked = checked;
                    this.from = from;
                    this.to = to;
                }
                toDOM(view) {
                    const box = document.createElement("input");
                    box.type = "checkbox";
                    box.className = "inline-cb cm-inline-cb";
                    box.checked = this.checked;
                    box.addEventListener("mousedown", (e) => e.preventDefault());
                    box.addEventListener("click", (e) => {
                        // Toggle the markdown text
                        const tr = view.state.update({
                            changes: { from: this.from, to: this.to, insert: this.checked ? "[ ]" : "[x]" }
                        });
                        view.dispatch(tr);
                    });
                    return box;
                }
            }
            while ((match = re.exec(text))) {
                const from = match.index;
                const to = from + match[0].length;
                const isChecked = /[xX]/.test(match[0]);
                // Only proceed if it's not followed by ( to avoid link syntax
                const nextChar = text[to];
                if (nextChar === '(') {
                    continue;
                }
                // Skip if inside code blocks or links
                const beforeText = text.substring(Math.max(0, from - 10), from);
                if (beforeText.includes('`') || beforeText.includes('](')) {
                    continue;
                }
                // Skip conversion if cursor is inside or immediately after this checkbox pattern
                if (cursorPos >= from && cursorPos <= to + 1) {
                    continue;
                }
                console.log(`Adding checkbox decoration: "${match[0]}" at ${from}-${to}`);
                builder.add(from, to, Decoration.replace({
                    widget: new CheckboxWidget(isChecked, from, to)
                }));
            }
            return builder.finish();
        }
        catch (error) {
            console.warn("Could not create checkbox decorations:", error);
            return null;
        }
    }
    addStyles() {
        const style = document.createElement("style");
        style.textContent = `
      .inline-cb {
        width: 1em;
        height: 1em;
        vertical-align: text-bottom;
        margin: 0 .1em;
        display: inline-block;
        flex-shrink: 0;
        box-sizing: border-box;
        padding: 0;
        border: 1px solid #ccc;
      }
      .cm-inline-cb {
        width: 1em;
        height: 1em;
        vertical-align: text-bottom;
        margin: 0 .1em;
        display: inline-block;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
        box-sizing: border-box;
        padding: 0;
        border: 1px solid #ccc;
      }
    `;
        document.head.appendChild(style);
    }
    process(root, ctx) {
        // Skip processing if we're currently updating to prevent re-creation
        if (this.isUpdating) {
            console.log("Skipping processing - currently updating");
            return;
        }
        // Skip if we don't know the source file
        const sourcePath = ctx.sourcePath;
        if (!sourcePath)
            return;
        // Walk text nodes; avoid code, pre, a, and list task items ("- [ ]")
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent)
                continue;
            const tag = parent.tagName;
            if (tag === "CODE" || tag === "PRE" || tag === "A")
                continue;
            // Don't interfere with normal task lists "- [ ]"
            if (parent.closest("li")?.textContent?.trim().startsWith("[") && parent.closest("ul,ol"))
                continue;
            const text = node.data;
            if (!text || !INLINE_CB.test(text)) {
                INLINE_CB.lastIndex = 0; // reset sticky state
                continue;
            }
            INLINE_CB.lastIndex = 0;
            // Build a fragment replacing each token with an input
            const frag = document.createDocumentFragment();
            let lastIdx = 0;
            let m;
            while ((m = INLINE_CB.exec(text))) {
                const before = text.slice(lastIdx, m.index);
                if (before)
                    frag.appendChild(document.createTextNode(before));
                const isChecked = /[xX]/.test(m[0]);
                const input = document.createElement("input");
                input.type = "checkbox";
                input.className = "inline-cb";
                // Data needed to update the file:
                // - sourcePath (file)
                // - section start line (via ctx.getSectionInfo)
                // - lineOffset (which line inside the section)
                // - ch (column of '[' within that line)
                const sec = ctx.getSectionInfo(root); // section of this rendered block
                if (!sec) {
                    // Fallback: we can still render but won’t allow toggling
                    input.disabled = true;
                }
                else {
                    // Compute line/ch for this match within section text
                    // Section text is the exact markdown that produced `root`.
                    const sectionText = sec.text;
                    // Recompute position safely by mapping node’s text to section text.
                    // Approach: find local line breaks up to this node’s textContent position.
                    // To keep things robust without DOM-to-source maps, we derive positions within the node only
                    // and store an offset token we’ll resolve later by searching around the section bounds.
                    input.dataset["file"] = ctx.sourcePath;
                    input.dataset["secStart"] = String(sec.lineStart);
                    input.dataset["matchText"] = m[0]; // "[ ]" or "[x]"
                    input.dataset["nodeTextBefore"] = text.slice(0, m.index).slice(-50); // last 50 chars before
                    input.dataset["nodeTextAfter"] = text.slice(m.index + m[0].length, m.index + m[0].length + 50); // next 50
                }
                input.checked = isChecked;
                // Store original state for comparison
                input.dataset["originalState"] = isChecked ? "checked" : "unchecked";
                input.dataset["markdownText"] = m[0]; // Store the original markdown text
                input.dataset["mode"] = "reading"; // Mark as reading mode checkbox
                console.log(`Creating checkbox: markdown="${m[0]}", isChecked=${isChecked}, visual=${input.checked}`);
                // Add click handler for reading mode
                input.addEventListener("click", async (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    const checkbox = e.target;
                    const newState = checkbox.checked;
                    const originalMarkdown = checkbox.dataset["markdownText"];
                    console.log(`Checkbox clicked, markdown was: "${originalMarkdown}", new visual state: ${newState}`);
                    // Store the intended state before processing
                    checkbox.dataset["pendingState"] = newState ? "checked" : "unchecked";
                });
                frag.appendChild(input);
                lastIdx = m.index + m[0].length;
            }
            const tail = text.slice(lastIdx);
            if (tail)
                frag.appendChild(document.createTextNode(tail));
            // Replace the original text node
            parent.replaceChild(frag, node);
        }
    }
    async onClick(evt) {
        const target = evt.target;
        if (!(target instanceof HTMLInputElement) || !target.classList.contains("inline-cb"))
            return;
        // Only apply aggressive event prevention for reading mode checkboxes
        const isReadingMode = target.dataset["mode"] === "reading";
        if (isReadingMode) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        const filePath = target.dataset["file"];
        const secStartStr = target.dataset["secStart"];
        if (!filePath || !secStartStr)
            return;
        const matchText = target.dataset["matchText"] || "[ ]";
        const beforeHint = target.dataset["nodeTextBefore"] ?? "";
        const afterHint = target.dataset["nodeTextAfter"] ?? "";
        console.log(`onClick handler called, current checked: ${target.checked}`);
        console.log(`Target element:`, target);
        console.log(`Original markdown: "${target.dataset["markdownText"]}"`);
        console.log(`Match text: "${matchText}"`);
        console.log(`Expected vs actual: expected=${/[xX]/.test(matchText)}, actual=${target.checked}`);
        // Determine the new state based on mode
        let newCheckedState;
        if (isReadingMode) {
            // Since we prevented default, manually toggle the checkbox
            newCheckedState = !target.checked;
            target.checked = newCheckedState;
        }
        else {
            // For edit mode, use the current state (browser handled the toggle)
            newCheckedState = target.checked;
        }
        console.log(`Processing checkbox change to: ${newCheckedState}`);
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof obsidian_1.TFile))
            return;
        try {
            // Set flag to prevent re-processing during our update
            this.isUpdating = true;
            // Read file and toggle the FIRST occurrence in the section that matches our before/after hints
            const content = await this.app.vault.read(file);
            const lines = content.split("\n");
            const secStart = Number(secStartStr);
            // Search window: from secStart to secStart+200 lines (reasonable upper bound)
            const windowEnd = Math.min(lines.length, secStart + 200);
            let foundLine = -1, foundCh = -1;
            const needle = (beforeHint + matchText + afterHint).replace(/\r/g, "");
            // Greedy but practical: scan lines and try to match the central token with surrounding hints
            for (let ln = secStart; ln < windowEnd && foundLine === -1; ln++) {
                const line = lines[ln];
                // Find all occurrences of matchText on this line
                for (let idx = line.indexOf(matchText); idx !== -1; idx = line.indexOf(matchText, idx + 1)) {
                    const left = line.slice(Math.max(0, idx - beforeHint.length), idx);
                    const right = line.slice(idx + matchText.length, idx + matchText.length + afterHint.length);
                    if (left === beforeHint.slice(-left.length) && right === afterHint.slice(0, right.length)) {
                        foundLine = ln;
                        foundCh = idx;
                        break;
                    }
                }
            }
            if (foundLine === -1) {
                // Couldn’t resolve exact position; fall back to toggling the visual element only
                target.checked = !target.checked;
                return;
            }
            const current = lines[foundLine].slice(foundCh, foundCh + 3);
            const next = target.checked ? "[ ]" : "[x]"; // invert because we prevented default earlier
            lines[foundLine] = lines[foundLine].slice(0, foundCh) + next + lines[foundLine].slice(foundCh + 3);
            await this.app.vault.modify(file, lines.join("\n"));
            // After write, flip the checkbox visually to match file
        }
        catch (error) {
            console.error("Error updating checkbox:", error);
            target.checked = !newCheckedState;
        }
        finally {
            // Reset the flag after a brief delay to prevent post-processor interference
            setTimeout(() => {
                this.isUpdating = false;
            }, 50);
        }
    }
}
exports.default = InlineCheckboxPlugin;
