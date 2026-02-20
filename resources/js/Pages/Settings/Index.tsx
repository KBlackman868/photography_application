import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Studio, PageProps } from '@/types';

interface Props extends PageProps {
    studio: Studio | null;
    packages: any[];
}

export default function SettingsIndex({ auth, studio, packages }: Props) {
    const { data, setData, put, processing } = useForm({
        name: studio?.name || '',
        description: studio?.description || '',
        email: studio?.email || '',
        phone: studio?.phone || '',
        website: studio?.website || '',
        timezone: studio?.timezone || 'UTC',
        branding: {
            primary_color: studio?.branding?.primary_color || '#197fe6',
            secondary_color: studio?.branding?.secondary_color || '#111921',
        },
        watermark_settings: {
            position: studio?.watermark_settings?.position || 'bottom-right',
            opacity: studio?.watermark_settings?.opacity || 30,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/studio');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold tracking-tight">Settings</h2>}
        >
            <Head title="Settings" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-6 space-y-8">
                    {/* Studio Settings */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-6">Studio Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Studio Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Website</label>
                                <input
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                    placeholder="https://"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary"
                                rows={3}
                            />
                        </div>

                        {/* Branding */}
                        <h4 className="font-semibold mt-8 mb-4">Branding</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={data.branding.primary_color}
                                        onChange={(e) => setData('branding', { ...data.branding, primary_color: e.target.value })}
                                        className="size-10 rounded-lg border border-slate-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={data.branding.primary_color}
                                        onChange={(e) => setData('branding', { ...data.branding, primary_color: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={data.branding.secondary_color}
                                        onChange={(e) => setData('branding', { ...data.branding, secondary_color: e.target.value })}
                                        className="size-10 rounded-lg border border-slate-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={data.branding.secondary_color}
                                        onChange={(e) => setData('branding', { ...data.branding, secondary_color: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Watermark */}
                        <h4 className="font-semibold mt-8 mb-4">Watermark</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Position</label>
                                <select
                                    value={data.watermark_settings.position}
                                    onChange={(e) => setData('watermark_settings', { ...data.watermark_settings, position: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                >
                                    {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].map((pos) => (
                                        <option key={pos} value={pos}>{pos.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Opacity ({data.watermark_settings.opacity}%)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={data.watermark_settings.opacity}
                                    onChange={(e) => setData('watermark_settings', { ...data.watermark_settings, opacity: parseInt(e.target.value) })}
                                    className="w-full accent-primary"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                Save Settings
                            </button>
                        </div>
                    </form>

                    {/* Packages */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Packages & Pricing</h3>
                        {packages.length === 0 ? (
                            <p className="text-sm text-slate-400">No packages configured yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {packages.map((pkg: any) => (
                                    <div key={pkg.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                        <h4 className="font-semibold">{pkg.name}</h4>
                                        <p className="text-2xl font-bold text-primary mt-1">${pkg.price}</p>
                                        <p className="text-xs text-slate-500 capitalize mt-1">{pkg.type}</p>
                                        {pkg.description && <p className="text-sm text-slate-600 mt-2">{pkg.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
