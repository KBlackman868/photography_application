import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { User, PageProps } from '@/types';

interface Props extends PageProps {
    client: User & {
        client_profile?: any;
        projects?: any[];
        bookings?: any[];
        invoices?: any[];
    };
}

export default function ClientShow({ auth, client }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/clients" className="hover:text-primary">Clients</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">{client.name}</span>
                    </nav>
                    <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
                </div>
            }
        >
            <Head title={client.name} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-500">
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{client.name}</h3>
                                    <p className="text-sm text-slate-500">{client.email}</p>
                                    {client.phone && <p className="text-sm text-slate-400">{client.phone}</p>}
                                </div>
                            </div>
                            {client.client_profile && (
                                <div className="space-y-3 text-sm">
                                    {client.client_profile.company && (
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Company</span>
                                            <p>{client.client_profile.company}</p>
                                        </div>
                                    )}
                                    {client.client_profile.notes && (
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Notes</span>
                                            <p className="text-slate-600">{client.client_profile.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Projects & galleries */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold mb-4">Projects</h3>
                                {client.projects && client.projects.length > 0 ? (
                                    <div className="space-y-3">
                                        {client.projects.map((project: any) => (
                                            <div key={project.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                                <div>
                                                    <p className="font-semibold">{project.name}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{project.type} &middot; {project.status.replace('_', ' ')}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {project.galleries?.map((g: any) => (
                                                        <Link
                                                            key={g.id}
                                                            href={`/galleries/${g.id}`}
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            {g.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">No projects yet.</p>
                                )}
                            </div>

                            {client.invoices && client.invoices.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                    <h3 className="font-bold mb-4">Invoices</h3>
                                    <div className="space-y-2">
                                        {client.invoices.map((invoice: any) => (
                                            <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                                <div>
                                                    <p className="font-semibold text-sm">{invoice.invoice_number}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{invoice.status}</p>
                                                </div>
                                                <p className="font-bold">${invoice.total}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
