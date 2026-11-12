import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-[#123B69] tracking-tight">
          Citizen Assistance & Helpdesk
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Have questions about scheme eligibility, document requirements, or portal functionality? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#123B69] to-[#0B2545] rounded-3xl p-8 text-white space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-4">Contact Information</h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#FF9933] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">Email Support</span>
                  <span className="text-slate-300">support@govscheme.nic.in</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#138808] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">National Toll-Free Helpdesk</span>
                  <span className="text-slate-300">1800-11-2026 (9 AM - 6 PM IST)</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#FF9933] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">Portal Coordination Office</span>
                  <span className="text-slate-300">
                    CGO Complex, Lodhi Road, New Delhi 110003
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <strong className="text-white block mb-1">State Nodal Seva Kendras:</strong>
            Citizens may also reach their nearest Common Service Centre (CSC) or Village Secretariat for in-person document scanning.
          </div>
        </div>

        {/* Feedback / Query Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Send Us a Message</h2>

          {submitted && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#138808]" />
              <span>Thank you! Your inquiry has been received. Our helpdesk team will respond promptly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Rao"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Query regarding PM-KISAN land document requirement"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Message / Query Details *
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your question or feedback..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#123B69] hover:bg-[#0B2545] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
