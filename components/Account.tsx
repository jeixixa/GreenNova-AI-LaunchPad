import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { getSavedItems } from '../services/storageService';
import { createPayPalOrder, capturePayPalOrder, TIER_PRICES } from '../services/paypalService';
import { Settings, CreditCard, LogOut, Database, ExternalLink, Save, User, Share2, Copy, Check, Crown, Zap, AlertTriangle, Lock, Loader2 } from 'lucide-react';

interface AccountProps {
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

interface SubscriptionState {
  plan: 'Free Trial' | 'Monthly Starter' | 'Annual Pro';
  status: 'Active' | 'Past Due' | 'Cancelled';
  renewalDate: string;
  features: {
    postsUsed: number;
    postsLimit: number;
    storageUsedMB: number;
    storageLimitMB: number;
  };
}

const Account: React.FC<AccountProps> = ({ onNavigate, onLogout }) => {
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  
  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
      name: 'James Shizha',
      email: 'james@greennovasystems.com'
  });

  // Subscription State
  const [subscription, setSubscription] = useState<SubscriptionState>({
    plan: 'Free Trial',
    status: 'Active',
    renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    features: {
      postsUsed: 12,
      postsLimit: 50,
      storageUsedMB: 15,
      storageLimitMB: 100
    }
  });

  const appLink = "https://greennova-threads.app/start?ref=james";

  // Load saved items and check for payment return
  useEffect(() => {
    // 1. Load Data Stats
    const items = getSavedItems();
    setSavedItemsCount(items.length);
    const json = JSON.stringify(items);
    const bytes = new Blob([json]).size;
    const mbUsed = parseFloat((bytes / (1024 * 1024)).toFixed(2));
    
    // 2. Load Subscription from Storage (if exists)
    const storedSub = localStorage.getItem('gn_subscription');
    if (storedSub) {
        setSubscription(JSON.parse(storedSub));
    } else {
        setSubscription(prev => ({
            ...prev,
            features: {
                ...prev.features,
                postsUsed: items.length,
                storageUsedMB: mbUsed < 0.1 ? 0.1 : mbUsed
            }
        }));
    }

    // 3. Handle PayPal Return
    const handlePaymentReturn = async () => {
        const params = new URLSearchParams(window.location.search);
        const isSuccess = params.get('payment_success');
        const token = params.get('token'); // PayPal Order ID
        const payerId = params.get('PayerID');
        const tier = params.get('tier') as 'pro' | 'agency' || 'pro';

        if (isSuccess === 'true' && token && payerId) {
            setProcessingPayment(true);
            try {
                await capturePayPalOrder(token);
                
                // Upgrade Logic
                const newSub: SubscriptionState = {
                    plan: tier === 'agency' ? 'Annual Pro' : 'Monthly Starter',
                    status: 'Active',
                    renewalDate: new Date(Date.now() + (tier === 'agency' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    features: {
                        postsUsed: items.length,
                        postsLimit: tier === 'agency' ? 9999 : 500,
                        storageUsedMB: mbUsed,
                        storageLimitMB: tier === 'agency' ? 10000 : 1000
                    }
                };
                
                setSubscription(newSub);
                localStorage.setItem('gn_subscription', JSON.stringify(newSub));
                setPaymentSuccess(`Successfully upgraded to ${tier === 'agency' ? 'Annual Pro' : 'Monthly Starter'} Plan!`);
                
                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
            } catch (error) {
                console.error(error);
                setPaymentError("Payment capture failed. Please contact support.");
            } finally {
                setProcessingPayment(false);
            }
        } else if (params.get('payment_cancel') === 'true') {
            setPaymentError("Payment was cancelled.");
            window.history.replaceState({}, '', window.location.pathname);
        }
    };

    handlePaymentReturn();
  }, []);

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.removeItem('greennova_saved_content');
      setSavedItemsCount(0);
      setSubscription(prev => ({
        ...prev,
        features: { ...prev.features, postsUsed: 0, storageUsedMB: 0 }
      }));
      alert('Local data cleared.');
    }
  };

  const handlePayPalUpgrade = async (tier: 'pro' | 'agency') => {
    if (subscription.plan === (tier === 'agency' ? 'Annual Pro' : 'Monthly Starter')) {
        alert("You are already on this plan!");
        return;
    }

    setProcessingPayment(true);
    setPaymentError('');
    
    try {
        const order = await createPayPalOrder(tier, "user_123"); // Mock User ID
        
        // Find approval link
        const approveLink = order.links.find((link: any) => link.rel === "approve");
        if (approveLink) {
            window.location.href = approveLink.href;
        } else {
            throw new Error("No approval link found in PayPal response");
        }
    } catch (error: any) {
        console.error("PayPal Error:", error);
        setPaymentError(error.message || "Failed to initiate payment");
        setProcessingPayment(false);
    }
  };

  const toggleEdit = () => {
      if (isEditing) {
          alert("Profile Updated Successfully!");
      }
      setIsEditing(!isEditing);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(appLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const calculateProgress = (used: number, limit: number) => {
    return Math.min(100, (used / limit) * 100);
  };

  if (processingPayment) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
              <Loader2 className="w-16 h-16 text-brand-500 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h2>
              <p className="text-gray-500 dark:text-gray-400">Please wait while we confirm your subscription.</p>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">My Account</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile, subscription, and data.</p>
      </div>

      {paymentSuccess && (
          <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl flex items-center mb-6 animate-fade-in">
              <Check className="w-5 h-5 mr-2" />
              {paymentSuccess}
          </div>
      )}

      {paymentError && (
          <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-xl flex items-center mb-6 animate-fade-in">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {paymentError}
          </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-lg text-white text-3xl font-black shrink-0 border-4 border-white dark:border-gray-700">
           {profile.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 text-center md:text-left w-full">
           {isEditing ? (
               <div className="space-y-3 max-w-sm mx-auto md:mx-0">
                   <div>
                       <label className="text-xs font-bold text-gray-500 uppercase ml-1">Display Name</label>
                       <input 
                           value={profile.name} 
                           onChange={(e) => setProfile({...profile, name: e.target.value})}
                           className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                       />
                   </div>
                   <div>
                       <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                       <input 
                           value={profile.email} 
                           onChange={(e) => setProfile({...profile, email: e.target.value})}
                           className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                       />
                   </div>
               </div>
           ) : (
               <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
               </>
           )}
           
           {!isEditing && (
             <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border 
                    ${subscription.plan === 'Annual Pro' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' 
                        : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700'}`}>
                    {subscription.plan}
                </span>
                <span className="text-xs text-gray-400">Member since 2025</span>
             </div>
           )}
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[160px]">
            <button 
                onClick={toggleEdit}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center
                    ${isEditing 
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-glow' 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'}`
                }
            >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
            <button onClick={onLogout} className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center">
                <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Billing Management */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Billing Management</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment & Subscription</p>
                    </div>
                 </div>
                 <div className="flex items-center text-xs text-gray-400 gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                     <Lock className="w-3 h-3" />
                     Secured by PayPal
                 </div>
             </div>

             <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5 mb-6 mt-4 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1">Current Plan</p>
                        <p className="text-xl font-black text-amber-900 dark:text-amber-100 flex items-center gap-2">
                            {subscription.plan}
                            {subscription.plan === 'Annual Pro' && <Crown className="w-5 h-5 text-amber-500 fill-current" />}
                        </p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-md text-xs font-bold border border-green-200 dark:border-green-800">
                        {subscription.status}
                    </span>
                </div>
                
                <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs font-medium text-amber-800 dark:text-amber-200 mb-1.5">
                            <span>Feature Usage</span>
                            <span>{subscription.features.postsUsed} / {subscription.features.postsLimit >= 9999 ? '∞' : subscription.features.postsLimit} posts</span>
                        </div>
                        <div className="h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${subscription.features.postsLimit >= 9999 ? 5 : calculateProgress(subscription.features.postsUsed, subscription.features.postsLimit)}%` }}
                            ></div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 mt-2">
                         <AlertTriangle className="w-3 h-3" />
                         <span>Renews on {subscription.renewalDate}</span>
                     </div>
                </div>
             </div>

             <div className="space-y-3">
                <button 
                    onClick={() => handlePayPalUpgrade('pro')}
                    disabled={subscription.plan !== 'Free Trial'}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-between group
                    ${subscription.plan !== 'Free Trial' 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-600' 
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'}`}
                >
                    Upgrade to Monthly ($29.99/mo)
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>

                <button 
                    onClick={() => handlePayPalUpgrade('agency')}
                    disabled={subscription.plan === 'Annual Pro'}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2
                    ${subscription.plan === 'Annual Pro'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-900/20'}`}
                >
                    {subscription.plan === 'Annual Pro' ? 'Pro Plan Active' : 'Upgrade to Annual Pro ($99.99/yr)'}
                    {subscription.plan !== 'Annual Pro' && <Zap className="w-4 h-4" />}
                </button>
             </div>
          </div>

          {/* App Data & Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                    <Database className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Data & Storage</h3>
             </div>
             
             <div className="space-y-6 flex-1">
                {/* Storage Meter */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Cloud Storage</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {subscription.features.storageUsedMB.toFixed(1)}MB / {subscription.features.storageLimitMB}MB
                        </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${calculateProgress(subscription.features.storageUsedMB, subscription.features.storageLimitMB)}%` }}
                        ></div>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-xs">
                         <span className="text-gray-500 dark:text-gray-400">Saved Items: {savedItemsCount}</span>
                         <button onClick={() => onNavigate(View.SAVED_POSTS)} className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center">
                            View Library <ExternalLink className="w-3 h-3 ml-1" />
                         </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onNavigate(View.SETTINGS)} className="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center">
                        <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                    <button onClick={clearData} className="py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10">
                        Clear Cache
                    </button>
                </div>
             </div>
          </div>
      </div>

      {/* Share Section */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-800 p-8 rounded-3xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Share2 className="w-64 h-64 -mr-10 -mt-10" />
         </div>
         
         <div className="relative z-10">
            <h3 className="text-2xl font-bold font-serif mb-2">Share GreenNova Threads</h3>
            <p className="text-brand-100 max-w-lg leading-relaxed">
                Invite your friends and colleagues. Help us grow the community of sustainable creators using AI.
            </p>
         </div>

         <div className="relative z-10 w-full md:w-auto bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/10 flex items-center">
            <a 
                href={appLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-mono text-brand-100 truncate max-w-[200px] md:max-w-xs hover:text-white hover:underline transition-colors cursor-pointer"
            >
                {appLink}
            </a>
            <button 
                onClick={copyLink}
                className="bg-white text-brand-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-50 transition-colors flex items-center ml-2 shrink-0"
            >
                {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {linkCopied ? 'Copied' : 'Copy Link'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default Account;