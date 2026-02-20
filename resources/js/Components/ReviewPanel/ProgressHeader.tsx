import { Gallery, GalleryProgress, SelectionProgress } from '@/types';
import { useState } from 'react';

interface Props {
    gallery: Gallery;
    progress: GalleryProgress;
    selectionProgress: SelectionProgress;
    onExport: (type: string) => void;
    onApproveSelection: () => void;
}

export default function ProgressHeader({
    gallery,
    progress,
    selectionProgress,
    onExport,
    onApproveSelection,
}: Props) {
    const [showExportModal, setShowExportModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);

    return (
        <>
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                        <a
                            href="/galleries"
                            className="text-slate-500 hover:text-primary transition-colors"
                        >
                            Galleries
                        </a>
                        <span className="material-symbols-outlined text-slate-300 text-xs">
                            chevron_right
                        </span>
                        <a
                            href={`/galleries/${gallery.id}`}
                            className="text-slate-500 hover:text-primary transition-colors"
                        >
                            {gallery.name}
                        </a>
                        <span className="material-symbols-outlined text-slate-300 text-xs">
                            chevron_right
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            Review Panel
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export for Editing
                        </button>
                        <button
                            onClick={() => setShowApproveModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">
                                check_circle
                            </span>
                            Approve Selection
                        </button>
                    </div>
                </div>

                {/* Progress bars */}
                <div className="flex items-center gap-8 mt-3">
                    {/* Comment resolution progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                            Comments Addressed
                        </span>
                        <div className="w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress.percent_resolved}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {progress.resolved_comments}/{progress.total_comments}
                        </span>
                        <span className="text-xs text-slate-400">
                            ({progress.percent_resolved}%)
                        </span>
                    </div>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                    {/* Selection progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                            Selection
                        </span>
                        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${selectionProgress.percent}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold">
                            {selectionProgress.selected}
                            {selectionProgress.limit
                                ? ` / ${selectionProgress.limit}`
                                : ''}{' '}
                            selected
                        </span>
                        {selectionProgress.is_locked && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                Locked
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Export for Editing</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Choose the export format:
                        </p>
                        <div className="space-y-2">
                            {[
                                { type: 'zip_originals', label: 'ZIP - Original Files', icon: 'folder_zip', desc: 'Full resolution originals' },
                                { type: 'zip_previews', label: 'ZIP - Web Previews', icon: 'photo_size_select_large', desc: 'Optimized previews for quick review' },
                                { type: 'lightroom_csv', label: 'Lightroom CSV', icon: 'table_chart', desc: 'Selection list for Lightroom import' },
                                { type: 'editing_brief', label: 'Editing Brief', icon: 'description', desc: 'Photos + client notes + crop requests' },
                                { type: 'selection_list', label: 'Selection List Only', icon: 'checklist', desc: 'CSV of selected photos with notes' },
                            ].map((opt) => (
                                <button
                                    key={opt.type}
                                    onClick={() => {
                                        onExport(opt.type);
                                        setShowExportModal(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                                >
                                    <span className="material-symbols-outlined text-primary text-2xl">
                                        {opt.icon}
                                    </span>
                                    <div>
                                        <span className="text-sm font-semibold block">
                                            {opt.label}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {opt.desc}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowExportModal(false)}
                            className="mt-4 w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Approve Selection Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary text-3xl">
                                check_circle
                            </span>
                            <h3 className="text-lg font-bold">Approve Selection</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">
                            This will lock the current selection of{' '}
                            <strong>{selectionProgress.selected}</strong> photos.
                        </p>
                        <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-6">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">
                                warning
                            </span>
                            Once approved, the client cannot modify their selection unless an
                            admin overrides the lock.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onApproveSelection();
                                    setShowApproveModal(false);
                                }}
                                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:brightness-110 transition-all"
                            >
                                Approve & Lock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
