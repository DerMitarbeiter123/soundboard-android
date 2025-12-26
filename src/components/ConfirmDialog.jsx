import { motion } from 'framer-motion';

export function ConfirmDialog({ title, message, confirmText = "Delete", cancelText = "Cancel", onConfirm, onCancel }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface-dark rounded-2xl shadow-2xl border border-red-500/30 overflow-hidden w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Icon */}
                    <div className="size-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white text-xl font-bold text-center mb-2">{title}</h3>

                    {/* Message */}
                    <p className="text-slate-400 text-sm text-center mb-6">{message}</p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
