"use client";

import {
  useState,
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";

type ToastVariant = "default" | "success" | "warning" | "destructive";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  const toast = useCallback((props: ToastProps) => {
    const id = Date.now();
    setToasts((current) => [...current, { ...props, id }]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, props.duration || 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Render toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md w-64 transition-all ${getVariantClass(
              toast.variant
            )}`}
          >
            {toast.title && <h4 className="font-semibold">{toast.title}</h4>}
            {toast.description && (
              <p className="text-sm">{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Helper to get the right class for the toast variant
function getVariantClass(variant?: ToastVariant): string {
  switch (variant) {
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "destructive":
      return "bg-red-100 text-red-800";
    default:
      return "bg-white text-gray-800";
  }
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
