"use client";

type ToastProps = {
  message: string;
};

export const Toast = ({ message }: ToastProps) => (
  <div className="fixed right-6 top-6 z-50 rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
    {message}
  </div>
);
