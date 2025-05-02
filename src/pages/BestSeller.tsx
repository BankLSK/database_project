import { motion } from 'framer-motion';
import './BestSeller.css';

const bestSellers = [
  { title: 'One Piece', image: '/public/bestsellers/onepiece.jpg', price: '$9.99' },
  { title: 'Naruto', image: '/public/bestsellers/naruto.jpg', price: '$8.99' },
  { title: 'Attack on Titan', image: '/public/bestsellers/aot.jpg', price: '$10.99' },
  { title: 'Demon Slayer', image: '/public/bestsellers/demonslayer.jpg', price: '$7.99' },
];

function BestSeller() {
  return (
    <motion.div 
      className="bestseller"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="bestseller-title">Top Selling Manga</h1>
      <div className="bestseller-grid">
        {bestSellers.map((manga, index) => (
          <motion.div 
            key={index} 
            className="bestseller-card"
            whileHover={{ scale: 1.05 }}
          >
            <img src={manga.image} alt={manga.title} />
            <h2>{manga.title}</h2>
            <p>{manga.price}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default BestSeller;
