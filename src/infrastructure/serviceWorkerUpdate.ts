/** What the UI needs to know about app updates; shaped for useSyncExternalStore. */
export interface UpdateSource {
  subscribe(listener: () => void): () => void;
  /** True once a new version has been downloaded and is waiting. */
  isAvailable(): boolean;
  apply(): void;
}

type RegisterServiceWorker = (options: {
  onNeedRefresh(): void;
}) => (reloadPage?: boolean) => Promise<void>;

/** Registers the service worker and reports when an update is waiting. */
export function createUpdateSource(register: RegisterServiceWorker): UpdateSource {
  const listeners = new Set<() => void>();
  let available = false;
  const activate = register({
    onNeedRefresh() {
      available = true;
      listeners.forEach((listener) => listener());
    },
  });

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isAvailable: () => available,
    apply: () => void activate(true),
  };
}

/** For environments without a service worker (tests, unsupported browsers). */
export const noUpdates: UpdateSource = {
  subscribe: () => () => {},
  isAvailable: () => false,
  apply: () => {},
};
