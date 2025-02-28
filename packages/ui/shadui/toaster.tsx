"use client"

import { useToast } from "@zephyr/ui/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@zephyr/ui/shadui/toast"

interface ToasterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  containerClassName?: string;
}

export function Toaster({ 
  position = "bottom-right",
  containerClassName
}: ToasterProps = {}) {
  const { toasts } = useToast()

  const getViewportClassName = () => {
    switch (position) {
      case "top-right":
        return "top-0 right-0";
      case "top-left":
        return "top-0 left-0";
      case "bottom-left":
        return "bottom-0 left-0";
      case "bottom-right":
      default:
        return "bottom-0 right-0";
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="min-w-[200px] max-w-md w-auto">
            <div className="relative pr-6">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              {action}
              <ToastClose className="absolute top-0 right-0" />
            </div>
          </Toast>
        )
      })}
      <ToastViewport className={`${getViewportClassName()} ${containerClassName || ""}`} />
    </ToastProvider>
  )
}
