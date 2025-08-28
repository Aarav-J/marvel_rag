'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, listChats, loginUser, passwordReset } from '@/utils';
import useStore from '@/store/useStore';
import toast, { Toaster } from 'react-hot-toast';
type Chat = { 
  id: string, 
  name: string
}
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const setMessages = useStore((state) => state.setMessages);
  const setChats = useStore((state) => state.setChats);
  const setUserId = useStore((state) => state.setUserId);
  const setUserName = useStore((state) => state.setUserName);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try { 
      const loginResponse = await loginUser(email, password);
      console.log("Login response:", loginResponse);
      
      // Get the user data and set userId in store
      const user = await getUser();
      if (user) {
        console.log("Setting userId:", user.$id);
        setUserId(user.$id); // Set userId in store
        setUserName(user.name); // Set userName in store
        // Now fetch chats with the userId
        const chats = await listChats(user.$id);
        setMessages([]); // Clear messages on new login
        console.log("Fetched chats:", chats);
        const newChats = chats.map((chat) => { 
          return {id: chat.$id, name: chat.chatId}
        })
        setChats(newChats)
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      toast.error("Login failed. Please check your credentials.");
      return;
    }
    
    setIsLoading(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <Toaster />
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-row items-center justify-center">
          <div className="px-6 py-2 bg-marvel-red flex justify-center items-center rounded-sm shadow-md mr-4">
            <span className="text-2xl font-bold tracking-widest text-white">MARVEL</span>
          </div>
          <span className="text-2xl font-normal text-marvel-red">Oracle</span>
        </div>
        <p className="text-gray-400 text-center mt-4">Sign in to access your timeline</p>
      </div>

      {/* Login Form */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
        
        <div className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <span onClick={async () => { 
            console.log("Password reset requested for:", email);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
            if (emailRegex.test(email)) {
              await passwordReset(email);
              toast.success("Password reset email sent!");
              console.log("Password reset email sent");
            } else {
              console.error("Invalid email format");
              toast.error("Please enter a valid email address");
            }
          }}className="text-sm text-red-400 hover:text-red-300">
            Forgot your password?
          </span>
        </div>
        
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-red-400 hover:text-red-300">
              Sign up
            </a>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Access the Marvel multiverse of knowledge</p>
      </div>
    </div>
  );
}
