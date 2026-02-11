type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

// Simple toast implementation - can be replaced with a proper toast library later
export function showToast({ message, type = 'info', duration = 3000 }: ToastOptions): void {
  const toast = document.createElement('div');
  
  const colors = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-info',
    warning: 'bg-warning',
  };

  toast.className = `fixed top-20 right-6 ${colors[type]} text-white px-6 py-4 rounded-md shadow-lg z-[100] animate-slideRight`;
  toast.textContent = message;
  toast.style.minWidth = '300px';
  toast.style.maxWidth = '500px';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 300ms ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}
