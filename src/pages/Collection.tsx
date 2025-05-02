import { motion } from 'framer-motion';
import './Collection.css';

const categories = [
  { title: 'Adventure', image: '/public/categories/adventure.jpg' },
  { title: 'Romance', image: '/public/categories/romance.jpg' },
  { title: 'Fantasy', image: '/public/categories/fantasy.jpg' },
  { title: 'Sci-Fi', image: '/public/categories/manga.jpg' },
  { title: 'Horror', image: '/public/categories/horror.jpg' },
  { title: 'Comedy', image: '/public/categories/comedy.jpg' },
];

function Collection() {
  return (
    <motion.div 
      className="collection"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="collection-title">Explore Categories</h1>
      <div className="card-grid">
        {categories.map((cat, index) => (
          <motion.div 
            key={index} 
            className="card"
            whileHover={{ scale: 1.05 }}
          >
            <img src={cat.image} alt={cat.title} />
            <h2>{cat.title}</h2>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Collection;
