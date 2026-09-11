// ReadyButton Component - Action button for status transitions

import type { OrderStatus } from '@/types/bar';
import { IconRenderer } from '@/components/ui/IconRenderer';

interface ReadyButtonProps {
  currentStatus: OrderStatus;
  isUpdating: boolean;
  onClick: () => void;
}

interface ButtonConfig {
  label: string;
  icon: string;
  color: string;
}

const getButtonConfig = (status: OrderStatus): ButtonConfig => {
  switch (status) {
    case 'PENDING':
      return { label: 'Start Preparing', icon: 'trending', color: 'bg-blue-600 hover:bg-blue-700' };
    case 'PREPARING':
      return { label: 'Mark Ready', icon: 'check', color: 'bg-green-600 hover:bg-green-700' };
    case 'READY':
      return { label: 'Mark Served', icon: 'serve', color: 'bg-purple-600 hover:bg-purple-700' };
    default:
      return { label: 'Update', icon: 'recycle', color: 'bg-zinc-600 hover:bg-zinc-700' };
  }
};

export function ReadyButton({ currentStatus, isUpdating, onClick }: ReadyButtonProps) {
  const config = getButtonConfig(currentStatus);

  return (
    <button
      className={`w-full py-2 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition ${config.color} disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={isUpdating}
    >
      {isUpdating ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Updating...</span>
        </>
      ) : (
        <>
          <IconRenderer icon={config.icon} className="w-4 h-4" />
          <span>{config.label}</span>
        </>
      )}
    </button>
  );
}
