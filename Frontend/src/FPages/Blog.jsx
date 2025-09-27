// src/pages/Blog.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiClock, FiTag } from "react-icons/fi";

const posts = [
  {
    id: 1,
    title: "Choosing the Right Food for Your Dog",
    excerpt:
      "Learn how to read pet food labels, choose the right protein, and select the right kibble size for your dog's age and breed.",
    date: "2025-08-10",
    tags: ["nutrition", "dogs"],
  },
  {
    id: 2,
    title: "Brushing & Grooming 101",
    excerpt:
      "Simple grooming routines that improve coat health and reduce shedding — tools, frequency, and tips for anxious pups.",
    date: "2025-07-04",
    tags: ["grooming", "care"],
  },
  {
    id: 3,
    title: "Travelling With Pets: A Practical Checklist",
    excerpt:
      "From paperwork to packing, here's a compact checklist for safe and stress-free travel with your pet.",
    date: "2025-06-01",
    tags: ["travel", "safety"],
  },
];

export default function Blog() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">PetPalooza Blog</h1>
        <p className="mt-2 text-gray-600">
          Expert tips, product guides and stories to help you take better care of your pets.
        </p>

        {/* search bar */}
        <div className="mt-6 max-w-md">
          <label className="relative block">
            <span className="sr-only">Search posts</span>
            <span className="absolute inset-y-0 left-3 flex items-center">
              <FiSearch className="text-gray-400" />
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search posts, e.g. nutrition, grooming"
              aria-label="Search posts"
            />
          </label>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* posts list */}
        <section className="lg:col-span-2 space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    <Link to={`/blog/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-gray-700">{post.excerpt}</p>
                </div>
                <div className="text-sm text-gray-500 text-right ml-4">
                  <div className="flex items-center gap-2">
                    <FiClock />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiTag />
                  <div className="flex gap-2">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 bg-gray-100 rounded text-gray-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/blog/${post.id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* sidebar */}
        <aside className="space-y-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Popular tags</h3>
            <div className="flex flex-wrap gap-2">
              {["nutrition", "training", "grooming", "travel", "health"].map(
                (t) => (
                  <button
                    key={t}
                    className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Subscribe</h3>
            <p className="text-sm text-gray-600">
              Get monthly updates and promos from PetPalooza.
            </p>
            <div className="mt-3">
              <input
                type="email"
                placeholder="you@domain.com"
                className="w-full px-3 py-2 border rounded focus:outline-none"
              />
              <button className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded">
                Subscribe
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm text-sm text-gray-600">
            <h3 className="font-semibold mb-2">About PetPalooza</h3>
            <p>
              PetPalooza is a trusted pet supply store delivering quality food,
              toys, and care essentials across India.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
