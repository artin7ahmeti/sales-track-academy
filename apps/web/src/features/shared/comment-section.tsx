'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, Pencil, Trash2, Reply, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/auth-provider';
import {
  getComments, createComment, updateComment, deleteComment,
  type Comment,
} from '@/lib/api/comments';

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}: {
  comment: Comment;
  currentUserId: string | undefined;
  onReply: (parentId: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
}) {
  const isOwn = comment.userId === currentUserId;
  const timeAgo = new Date(comment.createdAt).toLocaleDateString();

  return (
    <div className={depth > 0 ? 'ml-6 border-l pl-4' : ''}>
      <div className="flex items-start gap-2 py-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {comment.user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">{comment.body}</p>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="size-3 mr-1" />
              Reply
            </Button>
            {isOwn && (
              <>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-muted-foreground"
                  onClick={() => onEdit(comment)}
                >
                  <Pencil className="size-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-muted-foreground"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="size-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function CommentSection({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function fetchComments() {
    try {
      const data = await getComments(lessonId);
      setComments(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  async function handleSubmit() {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      if (editingComment) {
        await updateComment(editingComment.id, { body: body.trim() });
        toast.success('Comment updated');
        setEditingComment(null);
      } else {
        await createComment(lessonId, {
          body: body.trim(),
          parentId: replyTo || undefined,
        });
        toast.success('Comment posted');
        setReplyTo(null);
      }
      setBody('');
      fetchComments();
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReply(parentId: string) {
    setReplyTo(parentId);
    setEditingComment(null);
    setBody('');
  }

  function handleEdit(comment: Comment) {
    setEditingComment(comment);
    setBody(comment.body);
    setReplyTo(null);
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteComment(commentId);
      toast.success('Comment deleted');
      fetchComments();
    } catch {
      toast.error('Failed to delete comment');
    }
  }

  function cancelAction() {
    setReplyTo(null);
    setEditingComment(null);
    setBody('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="size-4" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          {(replyTo || editingComment) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {editingComment ? 'Editing comment' : 'Replying to a comment'}
              </span>
              <Button variant="ghost" size="icon-xs" onClick={cancelAction}>
                <X className="size-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={!body.trim() || submitting}
              onClick={handleSubmit}
              className="self-end"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>

        {/* Comments list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to start a discussion.
          </p>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
