import React from 'react';
import { FiMapPin, FiCheck, FiHeart, FiShield, FiClock, FiStar, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
    const steps = [
        {
            id: 1,
            title: 'Discover & Search',
            description: 'Browse through hundreds of verified properties. Use our smart filters to find exactly what you\'re looking for by location, price, and amenities.',
            icon: <FiMapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
            color: 'bg-blue-50 dark:bg-blue-900/30',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 2,
            title: 'Book Securely',
            description: 'Reserve your stay with our secure payment system. Get instant confirmation and detailed booking information. We handle everything for your peace of mind.',
            icon: <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />,
            color: 'bg-green-50 dark:bg-green-900/30',
            image: 'https://images.unsplash.com/photo-1563013544-824ae1fb9ad8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 3,
            title: 'Enjoy Your Stay',
            description: 'Experience authentic Sri Lankan hospitality. Our support team is available 24/7 for any assistance during your memorable getaway.',
            icon: <FiHeart className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
            color: 'bg-purple-50 dark:bg-purple-900/30',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];

    const features = [
        {
            title: 'Verified Hosts',
            description: 'Every host on our platform goes through a strict identity verification process.',
            icon: <FiShield className="w-6 h-6 text-blue-600" />
        },
        {
            title: '24/7 Support',
            description: 'Our dedicated support team is always ready to help you with any queries or issues.',
            icon: <FiClock className="w-6 h-6 text-blue-600" />
        },
        {
            title: 'Secure Payments',
            description: 'We use industry-leading encryption to ensure your payment details are always safe.',
            icon: <FiCheck className="w-6 h-6 text-blue-600" />
        },
        {
            title: 'Quality Stays',
            description: 'We manually check property quality to ensure they meet our high community standards.',
            icon: <FiStar className="w-6 h-6 text-blue-600" />
        }
    ];

    return (
        <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 mb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">How ShortStay Works</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Everything you need to know about finding, booking, and hosting amazing stays in Sri Lanka.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Steps */}
                <div className="space-y-24 mb-24">
                    {steps.map((step, index) => (
                        <div key={step.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
                            <div className="flex-1">
                                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                                    <span className="text-2xl font-bold">{step.id}</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                    {step.description}
                                </p>
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${step.color}`}>
                                        {step.icon}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-600 rounded-3xl transform rotate-3 group-hover:rotate-1 transition-transform duration-300 opacity-20"></div>
                                    <img
                                        src={step.image}
                                        alt={step.title}
                                        className="relative z-10 w-full h-80 object-cover rounded-3xl shadow-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Why Choose Us */}
                <section className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-xl mb-24 border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">The ShortStay Promise</h2>
                        <p className="text-gray-600 dark:text-gray-400">Your safety and experience are our top priorities</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <h2 className="text-3xl font-bold mb-6 relative z-10">Ready to find your next stay?</h2>
                    <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto relative z-10">
                        Join thousands of happy travelers and experience the best of Sri Lankan hospitality.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link to="/properties">
                            <button className="px-8 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                                Start Exploring <FiChevronRight />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
