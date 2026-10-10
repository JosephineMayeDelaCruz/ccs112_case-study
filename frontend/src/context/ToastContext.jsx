import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = (msg, tone) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone: tone || "default" }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  };

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={"toast-item " + t.tone}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
