import { motion } from 'framer-motion';
import './Home.css';

function Home() {
  return (
    <motion.div 
      className="home" 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }}
    >
      <div className="hero">
        <h1>Welcome to Manga World</h1>
        <p>Discover your next favorite story...</p>
        <a href="/collection" className="shop-now-btn">Start Reading</a>
      </div>
    </motion.div>
  );
}

export default Home;
