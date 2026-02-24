import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useRef, useState } from 'react';

interface TestimonialData {
    id: number;
    client_name: string;
    client_role: string | null;
    content: string;
    rating: number;
    photo_path: string | null;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
}

interface Props extends PageProps {
    testimonials: TestimonialData[];
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange?.(star)}
                    className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <svg
                        className={`w-5 h-5 ${star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

export default function TestimonialsIndex({ auth, testimonials }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<TestimonialData | null>(null);
    const [form, setForm] = useState({
        client_name: '',
        client_role: '',
        content: '',
        rating: 5,
        is_featured: false,
        is_active: true,
    });
    const [saving, setSaving] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const imgSrc = (path: string) => path.startsWith('http') ? path : '/storage/' + path;

    const openCreate = () => {
        setEditing(null);
        setForm({ client_name: '', client_role: '', content: '', rating: 5, is_featured: false, is_active: true });
        setShowModal(true);
    };

    const openEdit = (t: TestimonialData) => {
        setEditing(t);
        setForm({
            client_name: t.client_name,
            client_role: t.client_role || '',
            content: t.content,
            rating: t.rating,
            is_featured: t.is_featured,
            is_active: t.is_active,
        });
        setShowModal(true);
    };

    const handleSave = () => {
        setSaving(true);
        const payload = {
            client_name: form.client_name,
            client_role: form.client_role || null,
            content: form.content,
            rating: form.rating,
            is_featured: form.is_featured,
            is_active: form.is_active,
        };

        if (editing) {
            router.put(`/testimonials/${editing.id}`, payload, {
                onFinish: () => { setSaving(false); setShowModal(false); },
            });
        } else {
            router.post('/testimonials', payload, {
                onFinish: () => { setSaving(false); setShowModal(false); },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        router.delete(`/testimonials/${id}`);
    };

    const handlePhotoUpload = (testimonialId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        router.post(`/testimonials/${testimonialId}/photo`, formData);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold tracking-tight">Testimonials</h2>}
        >
            <Head title="Testimonials" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-lg">Client Testimonials</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Manage testimonials displayed on your public website.
                                </p>
                            </div>
                            <button
                                onClick={openCreate}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all"
                            >
                                Add Testimonial
                            </button>
                        </div>

                        {testimonials.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                </svg>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No testimonials yet. Add your first client testimonial.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {testimonials.map((t) => (
                                    <div key={t.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 group relative hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                        <div className="flex gap-4">
                                            {/* Photo */}
                                            <div className="flex-shrink-0">
                                                {t.photo_path ? (
                                                    <img
                                                        src={imgSrc(t.photo_path)}
                                                        alt={t.client_name}
                                                        className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                        {t.client_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-semibold">{t.client_name}</h4>
                                                    {t.client_role && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{t.client_role}</span>
                                                    )}
                                                    {t.is_featured && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {!t.is_active && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                                                            Hidden
                                                        </span>
                                                    )}
                                                </div>
                                                <StarRating rating={t.rating} />
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">"{t.content}"</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={photoInputRef}
                                                    onChange={(e) => handlePhotoUpload(t.id, e)}
                                                />
                                                <button
                                                    onClick={() => {
                                                        photoInputRef.current?.setAttribute('data-id', String(t.id));
                                                        photoInputRef.current?.click();
                                                    }}
                                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                                    title="Upload photo"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => openEdit(t)}
                                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl">
                        <h3 className="font-bold text-lg mb-6">
                            {editing ? 'Edit Testimonial' : 'New Testimonial'}
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Client Name *</label>
                                    <input
                                        type="text"
                                        value={form.client_name}
                                        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                        placeholder="Jane Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Role / Title</label>
                                    <input
                                        type="text"
                                        value={form.client_role}
                                        onChange={(e) => setForm({ ...form, client_role: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                        placeholder="e.g. Bride, Business Owner"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Testimonial *</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary"
                                    rows={4}
                                    placeholder="What did the client say about your work?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <StarRating
                                    rating={form.rating}
                                    onChange={(r) => setForm({ ...form, rating: r })}
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_featured}
                                        onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Featured</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Visible on website</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.client_name || !form.content}
                                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
