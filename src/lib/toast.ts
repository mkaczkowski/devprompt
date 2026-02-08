/**
 * Re-export sonner toast for consistent imports across the app.
 *
 * Click-to-dismiss behavior is handled globally by the Toaster component
 * via event delegation (see sonner.tsx). Toasts with action/cancel buttons
 * are excluded automatically.
 */
export { toast } from 'sonner';
