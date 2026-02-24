import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Project } from '@/types';

interface Props extends PageProps {
    projects: Project[];
}

export default function GalleryCreate({ auth, projects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        project_id: '',
        description: '',
        selection_limit: '',
        allow_downloads: false,
        allow_favorites: true,
        allow_comments: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/galleries');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold tracking-tight">Create Gallery</h2>}
        >
            <Head title="Create Gallery" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-6">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Gallery Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., The Miller Family Session"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Project</label>
                            <select
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select a project...</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} {p.client ? `(${p.client.name})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Description for the client..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Selection Limit</label>
                            <input
                                type="number"
                                value={data.selection_limit}
                                onChange={(e) => setData('selection_limit', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., 50 (leave empty for unlimited)"
                                min="1"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.allow_favorites}
                                    onChange={(e) => setData('allow_favorites', e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                />
                                Allow favorites
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.allow_comments}
                                    onChange={(e) => setData('allow_comments', e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                />
                                Allow comments
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.allow_downloads}
                                    onChange={(e) => setData('allow_downloads', e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                />
                                Allow downloads
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/galleries"
                                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                Create Gallery
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
