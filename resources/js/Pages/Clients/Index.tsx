import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { User, PageProps } from '@/types';
import { useState } from 'react';

interface ClientWithProfile extends User {
    client_profile?: { company?: string; notes?: string };
    projects_count?: number;
    projects?: any[];
}

interface Props extends PageProps {
    clients: { data: ClientWithProfile[] };
}

export default function ClientsIndex({ auth, clients }: Props) {
    const clientList = clients.data || [];
    const [showCreate, setShowCreate] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/clients', {
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
                    <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Add Client
                    </button>
                </div>
            }
        >
            <Head title="Clients" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {clientList.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-4 block">people</span>
                            <p className="text-lg font-medium">No clients yet</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Client</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Company</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Projects</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {clientList.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-sm">{client.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm">{client.email}</p>
                                                {client.phone && <p className="text-xs text-slate-400">{client.phone}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {client.client_profile?.company || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {client.projects_count ?? 0}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/clients/${client.id}`}
                                                    className="text-primary text-sm font-medium hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Create Modal */}
                    {showCreate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                                <h3 className="text-lg font-bold mb-4">Add Client</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone</label>
                                        <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Company</label>
                                        <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Notes</label>
                                        <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary" rows={3} />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50">Add Client</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
