import Link from 'next/link';

export default function ApplicationSubmitted() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-xl p-10 shadow-sm">
        <h1 className="text-4xl font-serif font-bold text-center mb-4" style={{ color: '#010080' }}>Application Submitted</h1>
        <p className="text-center text-gray-700 mb-6">Thank you for submitting your application. We've sent a confirmation email to your address. Your application is now <strong>pending approval</strong> by our team — you'll be notified once it is reviewed.</p>

        <div className="p-6 bg-gray-50 border rounded-lg">
          <ul className="space-y-4 text-sm text-gray-700">
            <li>✅ Your application will be reviewed within 5-7 business days</li>
            <li>✅ You'll receive an email notification about your application status</li>
            <li>✅ Check your email for any additional requirements</li>
          </ul>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="px-6 py-3 bg-blue-800 text-white rounded-lg">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}