import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Serverurl } from '../main';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const { userData } = useSelector(state => state.user);

    const handleSignup = async () => {
        setLoading(true);
        setErr("");
        try {
            const result = await axios.post(`${Serverurl}/api/auth/login`, {
                email: email, password: password
            }, {
                withCredentials: true
            });
            dispatch(setUserData(result.data.user));
            navigate("/profile");
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setErr(error.response?.data?.message || "Login failed. Please try again.");
            console.log("Login error", error);
        }
    }

    return (
        <div className='relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4'>
            <div className="mesh-gradient" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className='w-full max-w-[450px] glass p-8 md:p-10 rounded-[2.5rem] flex flex-col gap-8 relative z-10'
            >
                <div className='text-center'>
                    <motion.h1
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200'
                    >
                        Welcome Back
                    </motion.h1>
                    <p className='text-indigo-200 mt-2 text-sm opacity-80'>Log in to continue your conversations</p>
                </div>

                <form className='flex flex-col gap-5'
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSignup();
                    }}
                >
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
                        {password.length > 0 && (
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-indigo-300 hover:text-white transition-colors"
                                onClick={() => setShow(prev => !prev)}
                            >
                                {show ? <HiEyeOff /> : <HiEye />}
                            </button>
                        )}
                    </div>

                    {err && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='text-red-400 text-sm font-medium text-center'
                        >
                            {err}
                        </motion.p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className='btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                Processing...
                            </span>
                        ) : "Login"}
                    </motion.button>

                    <p className='text-center text-sm text-indigo-200 mt-4'>
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className='text-white font-bold hover:underline cursor-pointer transition-all'
                        >
                            Sign up
                        </span>
                    </p>
                </form>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] opacity-20" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20" />
        </div>
    )
}

export default Login

