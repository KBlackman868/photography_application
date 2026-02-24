import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Studio, PageProps } from '@/types';
import { useRef, useState } from 'react';

interface PackageData {
    id: number;
    name: string;
    description: string;
    price: number;
    type: string;
    includes: string[] | null;
    is_active: boolean;
}

interface HeroMedia {
    id: number;
    url: string;
    display_url: string;
    thumb_url: string;
}

interface StudioWithMedia extends Studio {
    logo_url?: string;
    photographer_photo_url?: string;
    hero_image_urls?: string[];
    hero_media?: HeroMedia[];
}

interface Props extends PageProps {
    studio: StudioWithMedia | null;
    packages: PackageData[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_HOURS: Record<string, { start: string; end: string; enabled: boolean }> = {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '15:00', enabled: false },
    sunday: { start: '10:00', end: '15:00', enabled: false },
};

const PACKAGE_TYPES = ['portrait', 'wedding', 'event', 'commercial', 'family', 'newborn', 'other'];

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
        availability_hours: studio?.availability_hours || DEFAULT_HOURS,
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [heroUploading, setHeroUploading] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);

    // Package modal state
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
    const [pkgForm, setPkgForm] = useState({ name: '', description: '', price: '', type: 'portrait' });
    const [pkgSaving, setPkgSaving] = useState(false);

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

    const handleDeleteHeroImage = (mediaId: number) => {
        router.delete('/settings/hero-images', { data: { media_id: mediaId } });
    };

    const handlePhotographerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        setPhotoUploading(true);
        router.post('/settings/photographer-photo', formData, {
            onFinish: () => {
                setPhotoUploading(false);
                if (photoInputRef.current) photoInputRef.current.value = '';
            },
        });
    };

    const handleDeletePhotographerPhoto = () => {
        router.delete('/settings/photographer-photo');
    };

    const imgSrc = (path: string) => (path.startsWith('http') || path.startsWith('/')) ? path : '/storage/' + path;

    // Package handlers
    const openCreatePackage = () => {
        setEditingPackage(null);
        setPkgForm({ name: '', description: '', price: '', type: 'portrait' });
        setShowPackageModal(true);
    };

    const openEditPackage = (pkg: PackageData) => {
        setEditingPackage(pkg);
        setPkgForm({
            name: pkg.name,
            description: pkg.description || '',
            price: String(pkg.price),
            type: pkg.type,
        });
        setShowPackageModal(true);
    };

    const handleSavePackage = () => {
        setPkgSaving(true);
        const payload = {
            name: pkgForm.name,
            description: pkgForm.description,
            price: parseFloat(pkgForm.price) || 0,
            type: pkgForm.type,
        };

        if (editingPackage) {
            router.put(`/settings/packages/${editingPackage.id}`, payload, {
                onFinish: () => {
                    setPkgSaving(false);
                    setShowPackageModal(false);
                },
            });
        } else {
            router.post('/settings/packages', payload, {
                onFinish: () => {
                    setPkgSaving(false);
                    setShowPackageModal(false);
                },
            });
        }
    };

    const handleDeletePackage = (id: number) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        router.delete(`/settings/packages/${id}`);
    };

    // Availability hours handler
    const updateHours = (day: string, field: string, value: string | boolean) => {
        setData('availability_hours', {
            ...data.availability_hours,
            [day]: {
                ...(data.availability_hours as any)[day],
                [field]: value,
            },
        });
    };

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
                            {studio?.logo_url ? (
                                <div className="relative group">
                                    <img
                                        src={studio.logo_url}
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
                                    {logoUploading ? 'Uploading...' : studio?.logo_url ? 'Change Logo' : 'Upload Logo'}
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

                        {studio?.hero_media && studio.hero_media.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                {studio.hero_media.map((media, idx) => (
                                    <div key={media.id} className="relative group aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <img
                                            src={media.display_url || media.url}
                                            alt={`Hero image ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {idx === 0 && (
                                            <span className="absolute top-2 left-2 bg-accent text-background-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                                Primary
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleDeleteHeroImage(media.id)}
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

                    {/* Photographer Photo */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-2">Photographer Photo</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Upload your photo for the "Meet the Photographer" section on the homepage.
                        </p>

                        <div className="flex items-center gap-6">
                            {studio?.photographer_photo_url ? (
                                <div className="relative group">
                                    <img
                                        src={studio.photographer_photo_url}
                                        alt="Photographer"
                                        className="w-24 h-32 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                    />
                                    <button
                                        onClick={handleDeletePhotographerPhoto}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove photo"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                </div>
                            )}

                            <div>
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotographerPhotoUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => photoInputRef.current?.click()}
                                    disabled={photoUploading}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {photoUploading ? 'Uploading...' : studio?.photographer_photo_url ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                <p className="text-xs text-slate-400 mt-1">Portrait orientation recommended (3:4 ratio). Max 10MB.</p>
                            </div>
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

                        {/* Availability Hours */}
                        <h4 className="font-semibold mt-8 mb-2">Availability Hours</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Set the hours you're available for booking. These times will appear as selectable slots on your booking page.
                        </p>
                        <div className="space-y-3">
                            {DAYS.map((day) => {
                                const hours = (data.availability_hours as any)[day] || DEFAULT_HOURS[day];
                                return (
                                    <div key={day} className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 w-32">
                                            <input
                                                type="checkbox"
                                                checked={hours.enabled}
                                                onChange={(e) => updateHours(day, 'enabled', e.target.checked)}
                                                className="rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className={`text-sm font-medium capitalize ${hours.enabled ? '' : 'text-slate-400'}`}>
                                                {day}
                                            </span>
                                        </label>
                                        {hours.enabled ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={hours.start}
                                                    onChange={(e) => updateHours(day, 'start', e.target.value)}
                                                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                                />
                                                <span className="text-slate-400 text-sm">to</span>
                                                <input
                                                    type="time"
                                                    value={hours.end}
                                                    onChange={(e) => updateHours(day, 'end', e.target.value)}
                                                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">Unavailable</span>
                                        )}
                                    </div>
                                );
                            })}
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Packages & Pricing</h3>
                            <button
                                onClick={openCreatePackage}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all"
                            >
                                Add Package
                            </button>
                        </div>
                        {packages.length === 0 ? (
                            <p className="text-sm text-slate-400">No packages configured yet. Click "Add Package" to create your first one.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {packages.map((pkg) => (
                                    <div key={pkg.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 group relative">
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditPackage(pkg)}
                                                className="w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeletePackage(pkg.id)}
                                                className="w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
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

            {/* Package Modal */}
            {showPackageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl">
                        <h3 className="font-bold text-lg mb-6">
                            {editingPackage ? 'Edit Package' : 'New Package'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Package Name *</label>
                                <input
                                    type="text"
                                    value={pkgForm.name}
                                    onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Wedding Premium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Price *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={pkgForm.price}
                                        onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Type *</label>
                                <select
                                    value={pkgForm.type}
                                    onChange={(e) => setPkgForm({ ...pkgForm, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                >
                                    {PACKAGE_TYPES.map((t) => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={pkgForm.description}
                                    onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary"
                                    rows={3}
                                    placeholder="Describe what's included in this package..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowPackageModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePackage}
                                disabled={pkgSaving || !pkgForm.name || !pkgForm.price}
                                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {pkgSaving ? 'Saving...' : editingPackage ? 'Update Package' : 'Create Package'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
