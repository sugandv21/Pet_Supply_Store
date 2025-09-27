import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api"; // your existing axios instance
import sampleAvatar from "../assets/productdes.png"; // optional placeholder

const REVIEWS_ENDPOINT = "/product-reviews/"; // POST { product, name, email, rating, review }

function Star({ filled = false, size = 18, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.791L20.9 24 12 19.897 3.1 24l2.966-8.999L.132 9.21l8.2-1.192z" />
    </svg>
  );
}

function StarsRow({ value = 0, size = 20, className = "" }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars.map((s) => (
        <Star key={s} filled={s <= Math.round(value)} size={size} className={s <= Math.round(value) ? "text-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  );
}

function RatingHistogram({ reviews = [] }) {
  // counts per star 1..5
  const counts = useMemo(() => {
    const cnt = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      cnt[idx] += 1;
    });
    return cnt;
  }, [reviews]);

  const total = counts.reduce((a, b) => a + b, 0) || 0;

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((star) => {
        const idx = star - 1;
        const pct = total === 0 ? 0 : Math.round((counts[idx] / total) * 100);
        return (
          <div key={star} className="flex items-center gap-3">
            <div className="w-20 flex items-center gap-2 text-sm">
              <div className="text-yellow-400 flex items-center">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} filled size={14} className="text-yellow-400" />
                ))}
              </div>
            </div>
            <div className="h-3 flex-1 bg-gray-200 rounded overflow-hidden">
              <div style={{ width: `${pct}%` }} className="h-full bg-gray-300 rounded" />
            </div>
            <div className="w-8 text-xs text-gray-500 text-right">{counts[idx]}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  // form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState(() => localStorage.getItem("review_name") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("review_email") || "");
  const [saveInfo, setSaveInfo] = useState(!!(localStorage.getItem("review_name") || localStorage.getItem("review_email")));

  // Load existing reviews for the product
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(REVIEWS_ENDPOINT, { params: { product: productId } })
      .then((res) => {
        if (cancelled) return;
        // assume response is array or paginated -> choose sensible fallback
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setReviews(data);
      })
      .catch((err) => {
        console.error("Failed to load reviews", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => (cancelled = true);
  }, [productId]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setServerError("");
    if (!rating) {
      setServerError("Please provide a rating.");
      return;
    }
    if (!reviewText.trim()) {
      setServerError("Please write your review.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setServerError("Name and email are required.");
      return;
    }

    setSubmitBusy(true);
    try {
      const payload = {
        product: productId,
        name: name.trim(),
        email: email.trim(),
        rating,
        review: reviewText.trim(),
      };

      // POST to backend - change endpoint if your backend expects different path
      const res = await api.post(REVIEWS_ENDPOINT, payload);

      // optimistic update: use returned object or fallback to payload + id
      const newReview = res?.data || { id: Date.now(), ...payload, created: new Date().toISOString() };
      setReviews((prev) => [newReview, ...prev]);

      // save name/email locally if requested
      if (saveInfo) {
        localStorage.setItem("review_name", name.trim());
        localStorage.setItem("review_email", email.trim());
      } else {
        localStorage.removeItem("review_name");
        localStorage.removeItem("review_email");
      }

      // reset form
      setRating(0);
      setHoverRating(0);
      setReviewText("");

      // show success modal
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to submit review", err);
      setServerError(err?.response?.data?.detail || "Failed to submit review. Please try again.");
    } finally {
      setSubmitBusy(false);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: ratings summary & histogram */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

         <div className="flex flex-col gap-6">
  {/* Average rating summary */}
  <div className="flex flex-col items-center">
    <div className="text-4xl font-bold">
      {average ? average.toFixed(1) : "0.0"}
    </div>
    <StarsRow value={average} size={20} className="mt-1" />
    <div className="text-sm text-gray-500 mt-1">
      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
    </div>
  </div>

  {/* Histogram */}
  <div>
    <RatingHistogram reviews={reviews} />
  </div>
</div>

        </div>

        {/* Right: submit form */}
        <div>
          <h3 className="text-lg font-semibold">Be the first to review this product</h3>
          <p className="text-sm text-gray-600 mt-1">Your email address will not be published. Required fields are marked <span className="text-red-500">*</span></p>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm font-medium">Your Rating <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2 mt-2" role="radiogroup" aria-label="Rating">
                {Array.from({ length: 5 }, (_, i) => {
                  const val = i + 1;
                  const filled = hoverRating ? val <= hoverRating : val <= rating;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleStarClick(val)}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`p-1 rounded ${filled ? "text-yellow-400" : "text-gray-300"}`}
                      aria-pressed={rating === val}
                      aria-label={`${val} star`}
                    >
                      <Star filled={filled} size={22} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Your Review <span className="text-red-500">*</span></label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={6}
                className="mt-2 block w-full border rounded-lg p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your review here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Your Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Your Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="saveInfo"
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="saveInfo" className="text-sm text-gray-700">
                Save my name, email, and website in this browser for the next time I comment.
              </label>
            </div>

            {serverError && <div className="text-sm text-red-600">{serverError}</div>}

            <div>
              <button
                type="submit"
                disabled={submitBusy}
                className={`inline-flex items-center px-6 py-3 rounded-full text-white font-semibold shadow ${
                  submitBusy ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitBusy ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* quick list of latest reviews under the widget (optional) */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-3">Latest reviews</h4>
        {loading ? (
          <div className="text-sm text-gray-500">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-gray-500">No reviews yet.</div>
        ) : (
          <ul className="space-y-4">
            {reviews.slice(0, 4).map((r) => (
              <li key={r.id} className="flex gap-3">
                <img src={sampleAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xs text-gray-500">{new Date(r.created || r.created_at || Date.now()).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-1">
                    <StarsRow value={r.rating} size={14} />
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{r.review}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Success modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg p-6 w-[min(540px,90%)] shadow-lg">
            <h3 className="text-xl font-semibold">Thank you!</h3>
            <p className="mt-3 text-gray-700">Your review was submitted successfully.</p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
