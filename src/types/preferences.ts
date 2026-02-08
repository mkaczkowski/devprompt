export type Theme = 'light' | 'dark' | 'system';

export type PreviewFormat = 'markdown' | 'xml' | 'preview';

export type ViewMode = 'code' | 'preview';

export interface Preferences {
  theme: Theme;
  previewFormat: PreviewFormat;
  viewModes: ViewMode[];
}
