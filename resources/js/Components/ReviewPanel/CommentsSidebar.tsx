import { Comment, User } from '@/types';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Props {
    comments: Comment[];
    photoId: number | null;
    currentUser: User;
    onCommentAdded: (comment: Comment) => void;
    onCommentResolved: (commentId: number, resolved: boolean) => void;
    onCommentDeleted: (commentId: number) => void;
}

export default function CommentsSidebar({
    comments,
    photoId,
    currentUser,
    onCommentAdded,
    onCommentResolved,
    onCommentDeleted,
}: Props) {
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const canMarkInternal = currentUser.role !== 'client';

    useEffect(() => {
        // Reset on photo change
        setReplyTo(null);
        setNewComment('');
    }, [photoId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !photoId) return;

        setSubmitting(true);
        try {
            const response = await axios.post(`/api/photos/${photoId}/comments`, {
                body: newComment.trim(),
                parent_id: replyTo,
                is_internal: canMarkInternal ? isInternal : false,
            });
            onCommentAdded(response.data.data);
            setNewComment('');
            setReplyTo(null);
            setIsInternal(false);
        } catch (err) {
            console.error('Failed to post comment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolve = async (commentId: number, currentlyResolved: boolean) => {
        try {
            const endpoint = currentlyResolved ? 'unresolve' : 'resolve';
            await axios.post(`/api/comments/${commentId}/${endpoint}`);
            onCommentResolved(commentId, !currentlyResolved);
        } catch (err) {
            console.error('Failed to toggle resolve:', err);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await axios.delete(`/api/comments/${commentId}`);
            onCommentDeleted(commentId);
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const focusInput = (parentId?: number) => {
        if (parentId) setReplyTo(parentId);
        inputRef.current?.focus();
    };

    if (!photoId) {
        return (
            <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <p className="text-slate-400 text-sm">Select a photo to view comments</p>
            </aside>
        );
    }

    return (
        <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm">Comments & Notes</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    {comments.length} thread{comments.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto">
                {comments.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-3xl mb-2 block opacity-40">
                            chat_bubble
                        </span>
                        No comments yet.
                        <br />
                        Be the first to leave feedback.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {comments.map((comment) => (
                            <CommentThread
                                key={comment.id}
                                comment={comment}
                                currentUser={currentUser}
                                onReply={() => focusInput(comment.id)}
                                onResolve={(id, resolved) => handleResolve(id, resolved)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Composer */}
            <form
                onSubmit={handleSubmit}
                className="border-t border-slate-200 dark:border-slate-800 p-3"
            >
                {replyTo && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-primary bg-primary/5 px-2 py-1 rounded">
                        <span>Replying to comment</span>
                        <button
                            type="button"
                            onClick={() => setReplyTo(null)}
                            className="ml-auto text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}
                <textarea
                    ref={inputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        {canMarkInternal && (
                            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                Internal note
                            </label>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                        {submitting ? (
                            <span className="material-symbols-outlined animate-spin text-sm">
                                progress_activity
                            </span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">send</span>
                        )}
                        Send
                    </button>
                </div>
            </form>
        </aside>
    );
}

function CommentThread({
    comment,
    currentUser,
    onReply,
    onResolve,
    onDelete,
}: {
    comment: Comment;
    currentUser: User;
    onReply: () => void;
    onResolve: (id: number, resolved: boolean) => void;
    onDelete: (id: number) => void;
}) {
    const isOwn = comment.user.id === currentUser.id;
    const canResolve = currentUser.role !== 'client';
    const canDelete = isOwn || currentUser.role === 'admin';

    return (
        <div className={`p-3 ${comment.is_internal ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
            <div className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="size-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500">
                    {comment.user.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{comment.user.name}</span>
                        {comment.is_internal && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded font-medium">
                                Internal
                            </span>
                        )}
                        {comment.user.role !== 'client' && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded font-medium capitalize">
                                {comment.user.role}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                        {comment.body}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-slate-400">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                            })}
                        </span>

                        <button
                            onClick={onReply}
                            className="text-[11px] text-slate-400 hover:text-primary font-medium"
                        >
                            Reply
                        </button>

                        {canResolve && !comment.parent_id && (
                            <button
                                onClick={() => onResolve(comment.id, comment.is_resolved)}
                                className={`text-[11px] font-medium flex items-center gap-0.5 ${
                                    comment.is_resolved
                                        ? 'text-green-600 hover:text-green-700'
                                        : 'text-slate-400 hover:text-green-600'
                                }`}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: comment.is_resolved ? "'FILL' 1" : "'FILL' 0" }}>
                                    check_circle
                                </span>
                                {comment.is_resolved ? 'Resolved' : 'Resolve'}
                            </button>
                        )}

                        {canDelete && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-[11px] text-slate-400 hover:text-red-500 font-medium"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-9 mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                            <div className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">
                                {reply.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold">{reply.user.name}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                    {reply.body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Resolved indicator */}
            {comment.is_resolved && comment.resolved_by && (
                <div className="mt-2 ml-9 flex items-center gap-1 text-[11px] text-green-600">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                    </span>
                    Resolved by {comment.resolved_by.name}
                </div>
            )}
        </div>
    );
}
