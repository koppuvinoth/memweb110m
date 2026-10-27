import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function RegistrationForm() {
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [session, setSession] = useState<any>(null);
  
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    const { data } = await supabase.from('districts').select('*').order('name');
    if (data) setDistricts(data);
  };

  const handleSendOTP = async () => {
    if (mobile.length !== 10) return alert('Enter a valid 10-digit Indian mobile number');
    const { error } = await supabase.auth.signInWithOtp({ phone: '+91' + mobile });
    if (error) alert(error.message);
    else setOtpSent(true);
  };

  const handleVerifyOTP = async () => {
    const { data, error } = await supabase.auth.verifyOtp({ phone: '+91' + mobile, token: otp, type: 'sms' });
    if (error) alert(error.message);
    else setSession(data.session);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Member Registration</h2>
      
      {!session ? (
        <div className="space-y-4">
          <label className="block text-sm font-semibold">Mobile Number</label>
          <div className="flex gap-2">
            <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} 
                   className="border p-2 rounded w-full" placeholder="10-digit number" />
            <button onClick={handleSendOTP} className="bg-amber-600 text-white px-4 py-2 rounded">
              {otpSent ? 'Resend' : 'Send OTP'}
            </button>
          </div>
          {otpSent && (
            <div className="flex gap-2 mt-2">
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} 
                     className="border p-2 rounded w-full" placeholder="Enter OTP" />
              <button onClick={handleVerifyOTP} className="bg-green-600 text-white px-4 py-2 rounded">Verify</button>
            </div>
          )}
        </div>
      ) : (
        <form className="space-y-4">
          <div className="bg-green-100 text-green-800 p-3 rounded text-sm font-semibold">
            ✓ Mobile number verified
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">Full Name *</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                   className="w-full border p-2 rounded mt-1" />
          </div>
          <button type="submit" className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg shadow mt-6">
            Register
          </button>
        </form>
      )}
    </div>
  );
}
