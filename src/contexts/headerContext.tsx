import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface HeaderState {
  /** Title shown in breadcrumb */
  promptTitle?: string;
  /** Callback when title is changed */
  onTitleChange?: (title: string) => void;
  /** Whether editor view is active */
  isEditorView: boolean;
}

interface HeaderContextValue extends HeaderState {
  setHeaderState: (state: Partial<Omit<HeaderState, 'isEditorView'>> & { isEditorView?: boolean }) => void;
  resetHeaderState: () => void;
}

const initialState: HeaderState = {
  promptTitle: undefined,
  onTitleChange: undefined,
  isEditorView: false,
};

const HeaderContext = createContext<HeaderContextValue | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HeaderState>(initialState);

  const setHeaderState = useCallback((newState: Partial<HeaderState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const resetHeaderState = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setHeaderState,
      resetHeaderState,
    }),
    [state, setHeaderState, resetHeaderState],
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeaderContext(): HeaderContextValue {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
}
