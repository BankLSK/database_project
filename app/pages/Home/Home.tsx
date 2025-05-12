import { motion } from 'framer-motion';
import Link from 'next/link';
import './Home.css';

export function Home() {
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
        <Link href="/shop">Start Reading</Link>
      </div>
    </motion.div>
  );
}

export default Home;
