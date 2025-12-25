import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiHome className="text-white" />
              </div>
              <span className="text-xl font-bold">ShortStay</span>
            </Link>
            <p className="text-gray-400">
              Your gateway to authentic Sri Lankan hospitality. Find unique stays and create memorable experiences.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/properties" className="text-gray-400 hover:text-white">Browse Properties</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
              <li><Link to="/host" className="text-gray-400 hover:text-white">Become a Host</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link to="/safety" className="text-gray-400 hover:text-white">Safety Information</Link></li>
              <li><Link to="/cancellation" className="text-gray-400 hover:text-white">Cancellation Options</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="text-gray-400 hover:text-white">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ShortStay. All rights reserved.
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">
              <FiFacebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <FiTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <FiInstagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <FiLinkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;