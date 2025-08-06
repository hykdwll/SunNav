import React, { useState, useEffect, useRef } from 'react';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, onClose, onEdit, onFavorite, isFavorite }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1"
      style={{ top: position.y, left: position.x }}
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        编辑书签
      </button>
      <button
        onClick={() => {
          onFavorite();
          onClose();
        }}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {isFavorite ? '取消收藏' : '收藏书签'}
      </button>
    </div>
  );
};

export default ContextMenu;