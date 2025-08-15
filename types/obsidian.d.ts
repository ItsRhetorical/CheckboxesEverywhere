// Minimal Obsidian API type definitions for development

declare module 'obsidian' {
  export class Plugin {
    onload(): void | Promise<void>;
    onunload(): void | Promise<void>;
    registerMarkdownPostProcessor(cb: (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void): void;
    registerDomEvent(el: Document | HTMLElement, type: string, cb: (evt: Event) => void): void;
    registerEvent(eventRef: any): void;
    app: App;
  }
  export class Notice {
    constructor(message: string);
  }
  export class App {
    vault: Vault;
    workspace: Workspace;
  }
  export class Vault {
    getAbstractFileByPath(path: string): TFile | null;
    read(file: TFile): Promise<string>;
    modify(file: TFile, data: string): Promise<void>;
  }
  export class Workspace {
    getActiveViewOfType<T>(type: any): T | null;
    getActiveViewOfType(type: typeof MarkdownView): MarkdownView | null;
    activeLeaf: WorkspaceLeaf | null;
    on(event: string, callback: () => void): any;
  }
  export class TFile {
    path: string;
    name: string;
  }
  export class WorkspaceLeaf {
    getViewState(): ViewState;
    view: MarkdownView;
  }
  export interface ViewState {
    type: string;
    state?: {
      mode?: string;
      source?: boolean;
    };
  }
  export class MarkdownView {
    file: TFile;
    editor: Editor;
    previewMode: { rerender(force: boolean): void };
    getMode(): string; // Returns 'source' or 'preview' or 'live'
  }
  export interface Editor {
    replaceRange(replacement: string, from: { line: number; ch: number }, to?: { line: number; ch: number }): void;
    getValue(): string;
    setValue(content: string): void;
    getLine(line: number): string;
    lineCount(): number;
  }
  export interface MarkdownPostProcessorContext {
    sourcePath: string;
    getSectionInfo(el: HTMLElement): { lineStart: number; text: string } | null;
  }
}
