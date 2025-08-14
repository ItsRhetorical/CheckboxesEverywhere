// Minimal Obsidian API type definitions for development
// For full types, copy from an installed Obsidian vault or use community types

declare module 'obsidian' {
  export class Plugin {
    addRibbonIcon(icon: string, title: string, callback: () => void): void;
    addCommand(options: { id: string; name: string; callback: () => void }): void;
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
    on(event: string, callback: () => void): any;
  }
  export class TFile {}
  export class MarkdownView {
    previewMode: { rerender(force: boolean): void };
    getMode(): string; // Returns 'source' or 'preview' or 'live'
  }
  export interface MarkdownPostProcessorContext {
    sourcePath: string;
    getSectionInfo(el: HTMLElement): { lineStart: number; text: string } | null;
  }
}
