import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage().props.auth.user as any;
    const fileInput = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        router.post(route('profile.avatar'), { avatar: file }, {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold tracking-tight">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-6 space-y-6">
                    {/* Avatar section */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Profile Photo</h3>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {user.avatar_path ? (
                                    <img
                                        src={`/storage/${user.avatar_path}`}
                                        alt={user.name}
                                        className="size-24 rounded-full object-cover border-2 border-slate-200"
                                    />
                                ) : (
                                    <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-slate-200">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-3">
                                    Upload a profile photo. JPG, PNG or GIF. Max 5MB.
                                </p>
                                <input
                                    ref={fileInput}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInput.current?.click()}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all"
                                >
                                    Change Photo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
