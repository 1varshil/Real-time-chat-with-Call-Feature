import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Serverurl } from '../main';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff } from 'react-icons/hi';

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [userName, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSignup = async () => {
    if (!userName || !email || !password) {
      setErr("Please fill all fields");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const result = await axios.post(`${Serverurl}/api/auth/signup`, {
        username: userName, email: email, password: password
      }, {
        withCredentials: true
      });
      setLoading(false);
      dispatch(setUserData(result.data));
      setuserName("");
      setEmail("");
      setPassword("");
      
      if (result.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Signup failed. Please try again.");
      setLoading(false);
      console.log("Signup error", error);
    }
  }

  return (
    <div className='relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4'>
      <div className="mesh-gradient" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-[480px] glass p-8 md:p-10 rounded-[2.5rem] flex flex-col gap-8 relative z-10'
      >
        <div className='text-center'>
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200'
          >
            Create Account
          </motion.h1>
          <p className='text-indigo-200 mt-2 text-sm opacity-80'>Join the conversation today</p>
        </div>

        <form className='flex flex-col gap-5'
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
        >
          <div className='relative group'>
            <HiOutlineUser className='absolute left-4 top-1/2 -translate-y-1/2 text-xl text-indigo-300 group-focus-within:text-white transition-colors' />
            <input
              type="text"
              placeholder='Username'
              className='input-field pl-12'
              onChange={(e) => setuserName(e.target.value)}
              value={userName}
              required
            />
          </div>

          <div className='relative group'>
            <HiOutlineMail className='absolute left-4 top-1/2 -translate-y-1/2 text-xl text-indigo-300 group-focus-within:text-white transition-colors' />
            <input
              type="email"
              placeholder='Email Address'
              className='input-field pl-12'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className='relative group'>
            <HiOutlineLockClosed className='absolute left-4 top-1/2 -translate-y-1/2 text-xl text-indigo-300 group-focus-within:text-white transition-colors' />
            <input
              type={show ? 'text' : 'password'}
              placeholder='Password'
              className='input-field pl-12 pr-12'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              type="button"
              className='absolute right-4 top-1/2 -translate-y-1/2 text-xl text-indigo-300 hover:text-white transition-colors'
              onClick={() => setShow(prev => !prev)}
            >
              {show ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>

          {err && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-400 text-sm font-medium text-center'
            >
              {err}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className='btn-primary mt-4'
          >
            {loading ? "Creating Account..." : "Sign up"}
          </motion.button>

          <p className='text-center text-sm text-indigo-200 mt-2'>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className='text-white font-bold hover:underline cursor-pointer transition-all'
            >
              Login
            </span>
          </p>
        </form>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] opacity-20" />
    </div>
  )
}

export default SignUp

