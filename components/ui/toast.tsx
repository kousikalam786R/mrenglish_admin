import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  open: boolean
  onClose: () => void
  duration?: number
}

export function Toast({
  title,
  description,
  variant = "default",
  open,
  onClose,
  duration = 3000,
}: ToastProps) {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [open, duration, onClose])

  if (!open) return null

  const variantStyles = {
    default: "bg-background border",
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <div
        className={cn(
          "rounded-lg border p-4 shadow-lg",
          variantStyles[variant]
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <div className="font-semibold mb-1">{title}</div>
            )}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-md p-1 hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast context for global toast management
interface ToastContextType {
  showToast: (props: Omit<ToastProps, "open" | "onClose">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<Omit<ToastProps, "open" | "onClose"> & { open: boolean }>({
    open: false,
  })

  const showToast = React.useCallback(
    (props: Omit<ToastProps, "open" | "onClose">) => {
      setToast({ ...props, open: true })
    },
    []
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        {...toast}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

