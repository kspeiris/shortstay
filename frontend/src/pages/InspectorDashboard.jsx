import React, { useState, useEffect } from 'react';
import { managerAPI } from '../services/api';
import { formatDate } from '../utils/format';
import {
    FiSearch, FiMapPin, FiCheck, FiX,
    FiRefreshCw, FiClipboard, FiShield, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const InspectorDashboard = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [inspectorNotes, setInspectorNotes] = useState('');
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchInspections();
    }, []);

    const fetchInspections = async () => {
        setLoading(true);
        try {
            const response = await managerAPI.getInspections();
            setProperties(response.data.data || []);
            toast.success('Inspection queue updated');
        } catch (error) {
            console.error('Failed to load inspections:', error);
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenVerify = (property) => {
        setSelectedProperty(property);
        setInspectorNotes(property.inspector_notes || '');
    };

    const handleVerify = async (badgeStatus) => {
        if (!selectedProperty) return;
        setVerifying(true);
        try {
            await managerAPI.verifyProperty(selectedProperty.id, {
                inspector_notes: inspectorNotes,
                verified_badge: badgeStatus
            });

            setProperties(properties.map(p =>
                p.id === selectedProperty.id
                    ? { ...p, inspector_notes: inspectorNotes, verified_badge: badgeStatus }
                    : p
            ));

            toast.success(`Property ${badgeStatus ? 'verified' : 'updated'}`);
            setSelectedProperty(null);
        } catch (error) {
            console.error('Failed to verify property:', error);
            toast.error('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Field Inspection</h1>
                        <p className="text-gray-600 dark:text-gray-400">Verify property authenticity and quality standards</p>
                    </div>
                    <button
                        onClick={fetchInspections}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                        Refresh Queue
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Properties List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiSearch className="text-blue-600" />
                            Inspection Queue ({properties.length})
                        </h2>

                        {properties.map((p) => (
                            <div
                                key={p.id}
                                className={`bg-white dark:bg-gray-900 p-5 rounded-2xl border transition-all cursor-pointer ${selectedProperty?.id === p.id
                                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                                        : 'border-gray-100 dark:border-gray-800 hover:border-blue-300'
                                    }`}
                                onClick={() => handleOpenVerify(p)}
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-32 h-24 rounded-xl relative overflow-hidden flex-shrink-0">
                                        <img
                                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'}
                                            alt={p.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {p.verified_badge && (
                                            <div className="absolute top-1 right-1 bg-blue-600 p-1 rounded-full border border-white">
                                                <FiShield className="w-2 h-2 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{p.title}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <FiMapPin className="w-3 h-3" />
                                                    {p.location}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Host: {p.host?.name} • Listed {formatDate(p.created_at)}
                                            </div>
                                            <button className="text-blue-600 text-sm font-medium hover:underline">
                                                Details & Inspection
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {properties.length === 0 && (
                            <div className="p-12 bg-white dark:bg-gray-900 rounded-2xl text-center border border-dashed border-gray-300 dark:border-gray-700">
                                <FiClipboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No properties currently require inspection.</p>
                            </div>
                        )}
                    </div>

                    {/* Inspection Work Area */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FiClipboard className="text-blue-600" />
                                Inspection Panel
                            </h2>

                            {!selectedProperty ? (
                                <div className="text-center py-12">
                                    <FiAlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">Select a property from the queue to start inspection</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Inspecting</p>
                                        <p className="font-bold text-gray-900 dark:text-white">{selectedProperty.title}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Inspection Notes
                                        </label>
                                        <textarea
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white h-40"
                                            placeholder="Enter detailed notes about the property condition, accuracy of photos, and location verification..."
                                            value={inspectorNotes}
                                            onChange={(e) => setInspectorNotes(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleVerify(true)}
                                            disabled={verifying}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                        >
                                            <FiShield />
                                            Grant Verified Badge
                                        </button>
                                        <button
                                            onClick={() => handleVerify(false)}
                                            disabled={verifying}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold rounded-xl transition-all"
                                        >
                                            <FiCheck />
                                            Save Notes Only
                                        </button>
                                        <button
                                            onClick={() => setSelectedProperty(null)}
                                            className="w-full py-2 text-sm text-gray-500 font-medium hover:text-red-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectorDashboard;
