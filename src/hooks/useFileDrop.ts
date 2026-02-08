import { useCallback, useRef, useState } from 'react';

import { toast } from '@/lib/toast';

/** Allowed text file extensions */
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.json', '.csv'];

/** Allowed MIME types (text/* catches most text files) */
const ALLOWED_MIME_PREFIXES = ['text/', 'application/json'];

/** Max file size: 1MB */
const MAX_FILE_SIZE = 1024 * 1024;

/** Accept attribute value for the hidden file input */
const FILE_ACCEPT = '.txt,.md,.json,.csv,text/plain,text/markdown,application/json,text/csv';

interface FileDropResult {
  title: string;
  content: string;
}

interface UseFileDropOptions {
  onFiles: (files: FileDropResult[]) => void;
}

interface UseFileDropReturn {
  isDragging: boolean;
  isProcessing: boolean;
  dragHandlers: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  openFilePicker: () => void;
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & { ref: React.RefObject<HTMLInputElement | null> };
}

/**
 * Strip extension from filename and format as a readable title.
 * e.g. "my-notes.md" → "My notes", "api_config.json" → "Api config"
 */
function fileNameToTitle(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  const name = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const spaced = name.replace(/[-_]+/g, ' ').trim();
  if (!spaced) return fileName;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Check if a file is an allowed text file by extension and MIME type.
 */
function isAllowedFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) return true;
  return ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix));
}

/**
 * Read a File as UTF-8 text.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Hook for handling drag-and-drop text file uploads.
 * Validates file types and sizes, reads content, and provides drag state.
 *
 * Operates on native HTML5 drag events (dataTransfer.types includes 'Files'),
 * so it does not conflict with @dnd-kit synthetic drag events used for reordering.
 */
export function useFileDrop({ onFiles }: UseFileDropOptions): UseFileDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dragCounterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      const validFiles: File[] = [];
      const rejectedNames: string[] = [];

      for (const file of files) {
        if (!isAllowedFile(file)) {
          rejectedNames.push(file.name);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File "${file.name}" exceeds 1MB limit`);
          continue;
        }
        validFiles.push(file);
      }

      if (rejectedNames.length > 0) {
        toast.error('Only text files are supported', {
          description: `Rejected: ${rejectedNames.join(', ')}`,
        });
      }

      if (validFiles.length === 0) return;

      setIsProcessing(true);
      try {
        const results: FileDropResult[] = [];
        for (const file of validFiles) {
          const content = await readFileAsText(file);
          results.push({
            title: fileNameToTitle(file.name),
            content,
          });
        }
        onFiles(results);
        toast.success(
          results.length === 1
            ? `Added section from "${validFiles[0].name}"`
            : `Added ${results.length} sections from files`,
        );
      } catch {
        toast.error('Failed to read files');
      } finally {
        setIsProcessing(false);
      }
    },
    [onFiles],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    // Only respond to file drags, not @dnd-kit synthetic drags
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      if (!e.dataTransfer.types.includes('Files')) return;
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset so the same file can be selected again
      e.target.value = '';
    },
    [processFiles],
  );

  return {
    isDragging,
    isProcessing,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    openFilePicker,
    inputProps: {
      ref: inputRef,
      type: 'file',
      multiple: true,
      accept: FILE_ACCEPT,
      onChange: handleInputChange,
      className: 'sr-only',
      tabIndex: -1,
      'aria-hidden': true,
    },
  };
}
