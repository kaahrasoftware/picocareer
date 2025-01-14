export default function Privacy() {
  return (
    <div className="container mx-auto py-8 prose prose-sm sm:prose lg:prose-lg">
      <h1>Privacy Policy</h1>
      
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us when you:</p>
      <ul>
        <li>Create an account</li>
        <li>Update your profile</li>
        <li>Participate in mentoring sessions</li>
        <li>Contact us</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide and maintain our services</li>
        <li>Match mentors with mentees</li>
        <li>Send notifications about sessions</li>
        <li>Improve our platform</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>We do not sell your personal information. We may share your information:</p>
      <ul>
        <li>With your consent</li>
        <li>To comply with laws</li>
        <li>To protect rights and safety</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information.</p>

      <h2>5. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Opt-out of communications</li>
      </ul>

      <h2>6. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us.</p>
    </div>
  );
}