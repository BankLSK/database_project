import { motion } from 'framer-motion';
import './BestSeller.css';

const bestSellers = [
  { title: 'One Piece', image: '/bestsellers/onepiece.jpg', price: '$9.99' },
  { title: 'Naruto', image: '/bestsellers/naruto.jpg', price: '$8.99' },
  { title: 'Attack on Titan', image: '/bestsellers/aot.jpg', price: '$10.99' },
  { title: 'Demon Slayer', image: '/bestsellers/demonslayer.jpg', price: '$7.99' },
  { title: 'Solo Leveling',image:'/bestsellers/sololeveling.jpg',price:'$9.99'},
  { title: 'Shangri-La Frontier',image:'/bestsellers/shangrila.jpg',price:'$8.49'},
  { title: 'Dr.Stone', image:'/bestsellers/drstone.jpg',price:'$9.49'},
  { title: 'Re:Zero', image:'/bestsellers/rezero.jpg',price:'$8.99'},
  { title: 'Fire Force', image: '/bestsellers/fireforce.jpg', price:'$7.99'},
  { title: 'My Hero Academia', image:'/bestsellers/mma.jpg',price:'$8.99'},
];

export function BestSeller() {
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
