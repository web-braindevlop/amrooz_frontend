'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { submitReview } from '@/lib/reviews';

function StarInput({ rating, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
          aria-label={`Rate ${star} stars`}
        >
          <span
            className={
              star <= (hover || rating)
                ? 'text-[#fbbf24]'
                : 'text-gray-300'
            }
          >
            ★
          </span>
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-primary/60">
          {rating} {rating === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
}

export default function AddReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview = await submitReview(productId, { rating, title, comment });
      setSuccess(true);
      setRating(0);
      setTitle('');
      setComment('');
      
      // Call parent callback to refresh reviews with the new review
      if (onSuccess) {
        onSuccess(newReview);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
        <p className="font-medium">Thank you for your review!</p>
        <p className="mt-1 text-sm">Your review has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-primary">
          Your Rating *
        </label>
        <StarInput rating={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-title" className="mb-2 block text-sm font-medium text-primary">
          Title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          placeholder="Summary of your review"
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-2 block text-sm font-medium text-primary">
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your thoughts about this product"
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
