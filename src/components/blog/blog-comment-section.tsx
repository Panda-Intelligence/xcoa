'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageCircle,
  Send,
  ThumbsUp,
  Reply,
  User,
  Calendar,
  Loader2
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  contentHtml: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  parentId: string | null;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  isEdited: boolean;
}

interface BlogCommentSectionProps {
  postId: string;
}

export function BlogCommentSection({ postId }: BlogCommentSectionProps) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/blog/${postId}/comments?limit=20&offset=${page * 20}&parentId=null`
      );
      const data = await response.json();

      if (data.success) {
        if (page === 0) {
          setComments(data.comments || []);
        } else {
          setComments((prev) => [...prev, ...(data.comments || [])]);
        }
        setHasMore(data.pagination?.hasMore || false);
      } else {
        toast.error(t('blog.comments.failed_to_load', 'Failed to load comments'));
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error(t('blog.comments.failed_to_load', 'Failed to load comments'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error(t('blog.comments.empty_comment', 'Comment cannot be empty'));
      return;
    }

    if (newComment.length > 5000) {
      toast.error(t('blog.comments.too_long', 'Comment is too long (max 5000 characters)'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blog/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          parentId: replyTo,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t('blog.comments.submitted', 'Comment submitted successfully'));
        setNewComment('');
        setReplyTo(null);
        // Refresh comments
        setPage(0);
        fetchComments();
      } else if (response.status === 429) {
        toast.error(t('blog.comments.rate_limit', 'Too many comments. Please wait before posting again.'));
      } else if (response.status === 401) {
        toast.error(t('blog.comments.login_required', 'Please sign in to comment'));
      } else {
        toast.error(data.error || t('blog.comments.failed', 'Failed to submit comment'));
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error(t('blog.comments.failed', 'Failed to submit comment'));
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    setPage((prev) => prev + 1);
  };

  if (loading && page === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">{t('blog.comments.loading', 'Loading comments...')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>
              {t('blog.comments.title', 'Comments')} ({comments.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Form */}
          <div className="space-y-2">
            {replyTo && (
              <div className="flex items-center justify-between bg-muted p-2 rounded">
                <span className="text-sm text-muted-foreground">
                  {t('blog.comments.replying_to', 'Replying to comment')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            )}
            <Textarea
              placeholder={t('blog.comments.placeholder', 'Write your comment... (Markdown supported)')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {newComment.length} / 5000
              </span>
              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {t('blog.comments.submit', 'Submit')}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 mt-6">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t('blog.comments.no_comments', 'No comments yet. Be the first to comment!')}
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={(commentId) => {
                    setReplyTo(commentId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))
            )}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={loadMoreComments} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {t('blog.comments.load_more', 'Load More Comments')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (commentId: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Comment Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.userAvatar} alt={comment.userName || 'User'} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {comment.userName || t('blog.anonymous', 'Anonymous')}
              </span>
              {comment.isEdited && (
                <Badge variant="secondary" className="text-xs">
                  {t('blog.comments.edited', 'Edited')}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Comment Content */}
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
      />

      {/* Comment Actions */}
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <button className="flex items-center hover:text-primary transition-colors">
          <ThumbsUp className="w-3 h-3 mr-1" />
          {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
        </button>
        <button
          onClick={() => onReply(comment.id)}
          className="flex items-center hover:text-primary transition-colors"
        >
          <Reply className="w-3 h-3 mr-1" />
          {t('blog.comments.reply', 'Reply')}
          {comment.replyCount > 0 && <span className="ml-1">({comment.replyCount})</span>}
        </button>
      </div>
    </div>
  );
}
