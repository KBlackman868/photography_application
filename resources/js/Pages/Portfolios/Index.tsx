import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Portfolio, PageProps } from '@/types';
import { useState } from 'react';

interface Props extends PageProps {
    portfolios: Portfolio[];
}

export default function PortfoliosIndex({ auth, portfolios }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const isAdmin = auth.user.role !== 'client';

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category: 'portrait' as string,
        is_published: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/portfolios', {
            onSuccess: () => {
                setShowCreate(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Portfolios</h2>
                    {isAdmin && (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Portfolio
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Portfolios" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {portfolios.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-4 block">collections</span>
                            <p className="text-lg font-medium">No portfolios yet</p>
                            <p className="text-sm mt-1">Create a portfolio to showcase your best work.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {portfolios.map((portfolio) => {
                                const coverSrc = portfolio.cover_photo_path
                                    ? (portfolio.cover_photo_path.startsWith('http') ? portfolio.cover_photo_path : `/storage/${portfolio.cover_photo_path}`)
                                    : null;
                                return (
                                    <div
                                        key={portfolio.id}
                                        onClick={() => router.visit(`/portfolios/${portfolio.id}/edit`)}
                                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                            {coverSrc ? (
                                                <img
                                                    src={coverSrc}
                                                    alt={portfolio.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined text-4xl">collections</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                    portfolio.is_published
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {portfolio.is_published ? 'Published' : 'Draft'}
                                                </span>
                                                <span className="px-2 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary capitalize">
                                                    {portfolio.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg">{portfolio.title}</h3>
                                            {portfolio.description && (
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{portfolio.description}</p>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-slate-400">
                                                    {portfolio.portfolio_photos_count ?? 0} photos
                                                </p>
                                                <span className="text-xs text-primary font-medium">
                                                    Edit & Upload Photos →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Create Modal */}
                    {showCreate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
                            >
                                <h3 className="text-lg font-bold mb-4">New Portfolio</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                        >
                                            {['wedding', 'portrait', 'event', 'commercial', 'newborn', 'landscape', 'other'].map((c) => (
                                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary"
                                            rows={3}
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={data.is_published}
                                            onChange={(e) => setData('is_published', e.target.checked)}
                                            className="rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        Publish immediately
                                    </label>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="flex-1 py-2.5 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
