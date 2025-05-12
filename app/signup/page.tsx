'use client';

import Signup from '../pages/Signup/Signup';

export default function SignupPage() {
  return <Signup />;
}

// import { useState } from 'react';

// export default function Signup() {
//   const [form, setForm] = useState({ firstname: '', middlename: '', lastname: '', email: '', phone: '',address: '', username: '', password: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async () => {
//     try {
//       const res = await fetch('http://localhost:8080/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(form)
//       });

//       const text = await res.text();
//       setMessage(text);
//     } catch (err) {
//       setMessage('Error signing up user');
//       console.error(err);
//     }
//   };

//   return (
//     <div>
//       <h1>Signup Page</h1>
//       <input
//         type="text"
//         name="firstname"
//         placeholder="firstname"
//         value={form.firstname}
//         onChange={handleChange}
//       /><br />
//       <input
//         type="text"
//         name="middlename"
//         placeholder="middlename"
//         value={form.middlename}
//         onChange={handleChange}
//       /><br />
//       <input
//         type="text"
//         name="lastname"
//         placeholder="lastname"
//         value={form.lastname}
//         onChange={handleChange}
//       /><br />
//       <input
//         type="email"
//         name="email"
//         placeholder="email"
//         value={form.email}
//         onChange={handleChange}
//       /><br />
//       <input
//         type="text"
//         name="phone"
//         placeholder="phone"
//         value={form.phone}
//         onChange={handleChange}
//       /><br />
//       <input
//         type="text"
//         name="address"
//         placeholder="address"
//         value={form.address}
//         onChange={handleChange}
//       /><br />
//       <input
//         type="text"
//         name="username"
//         placeholder="username"
//         value={form.username}
//         onChange={handleChange}
//       /><br />
//       <input
//         type="password"
//         name="password"
//         placeholder="password"
//         value={form.password}
//         onChange={handleChange}
//       /><br />
//       <button onClick={handleSignup}>Sign Up</button>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }
