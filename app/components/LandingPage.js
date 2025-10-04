'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, Clock, TrendingUp, Award } from 'lucide-react';
import Image from 'next/image'; // Import Next.js Image

const LandingPage = ({ onNavigate }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80"
  ];

  // Fix useEffect dependency
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]); // Add images.length to dependencies

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Regular Member",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      text: "The QR check-in system is fantastic! No more manual registers. I can track my workout hours easily."
    },
    {
      name: "Priya Sharma",
      role: "Fitness Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      text: "Best gym in Chennai! The digital attendance tracking helps me stay consistent with my fitness goals."
    },
    {
      name: "Vikram Reddy",
      role: "Premium Member",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      text: "Modern facilities with smart technology. The attendance system makes everything so convenient and professional."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent animate-fade-in">
              Muscle Art Fitness
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Transform Your Body. Track Your Progress. QR-Based Smart Attendance System.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('member-register')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-xl"
              >
                Join Now - Free Registration
              </button>
              <button 
                onClick={() => onNavigate('member-login')}
                className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20"
              >
                Member Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">World-Class Facilities</h2>
          <div className="relative h-96 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            {/* Replace img with Next.js Image */}
            <Image 
              src={images[currentImage]} 
              alt="Gym Facility"
              fill
              className="object-cover transition-opacity duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentImage ? 'bg-orange-500 w-8' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentImage(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-black/30 to-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Smart Gym Features</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Experience the future of fitness with our QR-based attendance system
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <QrCode size={40} />,
                title: 'QR Code Check-In/Out',
                description: 'Scan QR code to punch in and out instantly. No manual registers, completely contactless.'
              },
              {
                icon: <Clock size={40} />,
                title: 'Automatic Time Tracking',
                description: 'System automatically calculates your workout duration. View your daily and monthly stats.'
              },
              {
                icon: <TrendingUp size={40} />,
                title: 'Progress Analytics',
                description: 'Track attendance patterns, workout consistency, and improve your fitness journey.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-orange-500">
                <div className="text-orange-500 flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/40">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-4">What Our Members Say</h2>
          <p className="text-gray-400 text-center mb-12">Real experiences from real people</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-orange-500 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  {/* Replace img with Next.js Image */}
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover border-2 border-orange-500"
                  />
                  <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                {/* Fix unescaped entities */}
                <p className="text-gray-300 italic">&ldquo;{testimonial.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Fitness Journey?</h2>
          <p className="text-white/90 text-xl mb-8">Join hundreds of members using our smart attendance system</p>
          <button 
            onClick={() => onNavigate('member-register')}
            className="bg-white text-orange-500 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started - It&apos;s Free!
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Muscle Art Fitness. All rights reserved.</p>
          <p className="mt-2 text-sm">Powered by Smart QR Attendance System</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;