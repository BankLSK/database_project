'use client';

import { motion } from 'framer-motion';
import './Collection.css';
import Link from 'next/link';

const categories = [
  { title: 'Adventure', image: '/categories/adventure.jpg' },
  { title: 'Romance', image: '/categories/romance.jpg' },
  { title: 'Fantasy', image: '/categories/fantasy.jpg' },
  { title: 'Sci-Fi', image: '/categories/manga.jpg' },
  { title: 'Horror', image: '/categories/horror.jpg' },
  { title: 'Comedy', image: '/categories/comedy.jpg' },
];

export function Collection(){
  return (
    <motion.div
      className="collection"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="collection-title">Explore Categories</h1>
      <div className="card-grid buy-card">
        {categories.map((cat, index) => (
          <Link
            key={index}
            href={`/showcase?category=${encodeURIComponent(cat.title)}`}
          >
            <motion.div className="card" whileHover={{ scale: 1.05 }}>
              <img src={cat.image} alt={cat.title} />
              <h2>{cat.title}</h2>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default Collection;
