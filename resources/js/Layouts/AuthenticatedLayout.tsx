import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage().props as any;
    const user = page.auth.user;
    const isAdmin = user.role !== 'client';
    const studioLogo = page.studio_logo as string | null;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center gap-3">
                                {studioLogo ? (
                                    <img
                                        src={studioLogo.startsWith('http') ? studioLogo : `/storage/${studioLogo}`}
                                        alt="Logo"
                                        className="w-9 h-9 rounded-lg object-contain"
                                    />
                                ) : (
                                    <div className="bg-primary text-white p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-lg block">photo_camera</span>
                                    </div>
                                )}
                                <div>
                                    <h1 className="font-bold text-sm tracking-tight">Kyle Blackman Photography</h1>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                                        {isAdmin ? 'Admin Portal' : 'Client Portal'}
                                    </p>
                                </div>
                            </Link>

                            <div className="hidden space-x-6 sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('galleries.index')}
                                    active={route().current('galleries.*')}
                                >
                                    Galleries
                                </NavLink>
                                {isAdmin && (
                                    <>
                                        <NavLink
                                            href={route('projects.index')}
                                            active={route().current('projects.*')}
                                        >
                                            Projects
                                        </NavLink>
                                        <NavLink
                                            href={route('clients.index')}
                                            active={route().current('clients.*')}
                                        >
                                            Clients
                                        </NavLink>
                                        <NavLink
                                            href={route('portfolios.index')}
                                            active={route().current('portfolios.*')}
                                        >
                                            Portfolios
                                        </NavLink>
                                        <NavLink
                                            href={route('bookings.index')}
                                            active={route().current('bookings.*')}
                                        >
                                            Bookings
                                        </NavLink>
                                        <NavLink
                                            href={route('settings.index')}
                                            active={route().current('settings.*')}
                                        >
                                            Settings
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <button
                                onClick={toggleTheme}
                                className="me-2 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
                                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to night mode'}
                            >
                                {theme === 'dark' ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                    </svg>
                                )}
                            </button>
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
                                            >
                                                <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                {user.name}
                                                <svg
                                                    className="h-4 w-4 text-slate-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden gap-1">
                            <button
                                onClick={toggleTheme}
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400 focus:outline-none"
                                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to night mode'}
                            >
                                {theme === 'dark' ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-500 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-500 focus:outline-none"
                            >
                                <span className="material-symbols-outlined">
                                    {showingNavigationDropdown ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('galleries.index')}
                            active={route().current('galleries.*')}
                        >
                            Galleries
                        </ResponsiveNavLink>
                        {isAdmin && (
                            <>
                                <ResponsiveNavLink
                                    href={route('projects.index')}
                                    active={route().current('projects.*')}
                                >
                                    Projects
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('clients.index')}
                                    active={route().current('clients.*')}
                                >
                                    Clients
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('portfolios.index')}
                                    active={route().current('portfolios.*')}
                                >
                                    Portfolios
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('bookings.index')}
                                    active={route().current('bookings.*')}
                                >
                                    Bookings
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('settings.index')}
                                    active={route().current('settings.*')}
                                >
                                    Settings
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-slate-800 dark:text-slate-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
