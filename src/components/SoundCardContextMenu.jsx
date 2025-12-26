import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from './ConfirmDialog';
import clsx from 'clsx';

export function SoundCardContextMenu({ sound, onShare, onEdit, onDelete, onClose }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-surface-dark rounded-2xl shadow-2xl border border-slate-700 overflow-hidden w-full max-w-xs"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                        <div
                            className="size-12 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: sound.color || '#2b8cee' }}
                        >
                            <span className="material-symbols-outlined text-2xl text-white">
                                {sound.icon || 'campaign'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm truncate">{sound.name}</h3>
                            <p className="text-slate-500 text-xs">Sound options</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                onShare();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-primary">share</span>
                            <div className="flex-1">
                                <p className="text-white font-medium text-sm">Share to Community</p>
                                <p className="text-slate-500 text-xs">Let others use this sound</p>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                onEdit();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-slate-400">edit</span>
                            <div className="flex-1">
                                <p className="text-white font-medium text-sm">Edit Sound</p>
                                <p className="text-slate-500 text-xs">Change name, icon, or color</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-red-500">delete</span>
                            <div className="flex-1">
                                <p className="text-red-500 font-medium text-sm">Delete Sound</p>
                                <p className="text-slate-500 text-xs">Remove from your board</p>
                            </div>
                        </button>
                    </div>

                    {/* Cancel */}
                    <div className="p-2 border-t border-slate-800">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {showDeleteConfirm && (
                    <ConfirmDialog
                        title="Delete Sound?"
                        message={`Are you sure you want to delete "${sound.name}"? This action cannot be undone.`}
                        confirmText="Delete"
                        cancelText="Cancel"
                        onConfirm={() => {
                            onDelete();
                            onClose();
                        }}
                        onCancel={() => setShowDeleteConfirm(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
