import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Studio, PageProps } from '@/types';
import { useRef, useState } from 'react';

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
        social_links: {
            instagram: studio?.social_links?.instagram || '',
            facebook: studio?.social_links?.facebook || '',
        },
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [heroUploading, setHeroUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/studio');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        setLogoUploading(true);
        router.post('/settings/logo', formData, {
            onFinish: () => {
                setLogoUploading(false);
                if (logoInputRef.current) logoInputRef.current.value = '';
            },
        });
    };

    const handleDeleteLogo = () => {
        router.delete('/settings/logo');
    };

    const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('hero_images[]', files[i]);
        }

        setHeroUploading(true);
        router.post('/settings/hero-images', formData, {
            onFinish: () => {
                setHeroUploading(false);
                if (heroInputRef.current) heroInputRef.current.value = '';
            },
        });
    };

    const handleDeleteHeroImage = (index: number) => {
        router.delete('/settings/hero-images', { data: { index } });
    };

    const imgSrc = (path: string) => path.startsWith('http') ? path : '/storage/' + path;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold tracking-tight">Settings</h2>}
        >
            <Head title="Settings" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-6 space-y-8">

                    {/* Logo Upload */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Studio Logo</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Upload your logo to display in the navigation bar. Recommended size: 200x200px or larger.
                        </p>

                        <div className="flex items-center gap-6">
                            {studio?.logo_path ? (
                                <div className="relative group">
                                    <img
                                        src={imgSrc(studio.logo_path)}
                                        alt="Studio logo"
                                        className="w-20 h-20 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                    <button
                                        onClick={handleDeleteLogo}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove logo"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                    </svg>
                                </div>
                            )}

                            <div>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={logoUploading}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {logoUploading ? 'Uploading...' : studio?.logo_path ? 'Change Logo' : 'Upload Logo'}
                                </button>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Images */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-2">Hero Images</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Upload images for the hero section on your public-facing website. The first image will be the primary hero background.
                        </p>

                        {/* Existing hero images */}
                        {studio?.hero_images && studio.hero_images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                {studio.hero_images.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <img
                                            src={imgSrc(img)}
                                            alt={`Hero image ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {idx === 0 && (
                                            <span className="absolute top-2 left-2 bg-accent text-background-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                                Primary
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleDeleteHeroImage(idx)}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <input
                                ref={heroInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleHeroUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => heroInputRef.current?.click()}
                                disabled={heroUploading}
                                className="px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors disabled:opacity-50"
                            >
                                {heroUploading ? 'Uploading...' : 'Upload Hero Images'}
                            </button>
                            <p className="text-xs text-slate-400 mt-1">Upload high-resolution images (1920px+ wide recommended). Max 20MB each.</p>
                        </div>
                    </div>

                    {/* Studio Settings */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-6">Business Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Business Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Website</label>
                                <input
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                    placeholder="https://"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary"
                                rows={3}
                            />
                        </div>

                        {/* Social Links */}
                        <h4 className="font-semibold mt-8 mb-4">Social Links</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Instagram Username</label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-l-lg text-sm text-slate-500">@</span>
                                    <input
                                        type="text"
                                        value={data.social_links.instagram}
                                        onChange={(e) => setData('social_links', { ...data.social_links, instagram: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-r-lg text-sm focus:ring-2 focus:ring-primary"
                                        placeholder="kyleblackmanphotography_"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Facebook URL</label>
                                <input
                                    type="url"
                                    value={data.social_links.facebook}
                                    onChange={(e) => setData('social_links', { ...data.social_links, facebook: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
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
                                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary font-mono"
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
                                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary font-mono"
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
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
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
                                        {pkg.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{pkg.description}</p>}
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
