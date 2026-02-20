import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Project, PageProps } from '@/types';
import { useState } from 'react';

interface Props extends PageProps {
    projects: { data: Project[] };
}

export default function ProjectsIndex({ auth, projects }: Props) {
    const projectList = projects.data || [];
    const [showCreate, setShowCreate] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'portrait',
        description: '',
        shoot_date: '',
        location: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects', {
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
                    <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        New Project
                    </button>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {projectList.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-4 block">folder</span>
                            <p className="text-lg font-medium">No projects yet</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Project</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Client</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Galleries</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Shoot Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {projectList.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 font-semibold text-sm">{project.name}</td>
                                            <td className="px-4 py-3 text-sm capitalize">{project.type}</td>
                                            <td className="px-4 py-3 text-sm">{project.client?.name || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                                    {
                                                        inquiry: 'bg-slate-100 text-slate-600',
                                                        booked: 'bg-blue-100 text-blue-700',
                                                        in_progress: 'bg-amber-100 text-amber-700',
                                                        delivered: 'bg-green-100 text-green-700',
                                                        completed: 'bg-green-100 text-green-700',
                                                        archived: 'bg-slate-100 text-slate-500',
                                                    }[project.status] || 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{project.galleries_count ?? 0}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                                {project.shoot_date ? new Date(project.shoot_date).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showCreate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                                <h3 className="text-lg font-bold mb-4">New Project</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary">
                                            {['wedding', 'portrait', 'event', 'commercial', 'newborn', 'engagement', 'other'].map((t) => (
                                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Shoot Date</label>
                                        <input type="date" value={data.shoot_date} onChange={(e) => setData('shoot_date', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Location</label>
                                        <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200">Cancel</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50">Create</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
