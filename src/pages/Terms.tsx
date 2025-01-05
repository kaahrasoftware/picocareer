export default function Terms() {
  return (
    <div className="container mx-auto py-8 prose prose-sm sm:prose lg:prose-lg">
      <h1>Terms and Conditions</h1>
      
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using this platform, you accept and agree to be bound by these Terms and Conditions.</p>

      <h2>2. User Accounts</h2>
      <p>You must:</p>
      <ul>
        <li>Provide accurate information when registering</li>
        <li>Maintain the security of your account</li>
        <li>Notify us of any unauthorized use</li>
        <li>Be at least 18 years old to create an account</li>
      </ul>

      <h2>3. Mentoring Services</h2>
      <p>As a mentor or mentee, you agree to:</p>
      <ul>
        <li>Attend scheduled sessions on time</li>
        <li>Maintain professional conduct</li>
        <li>Respect confidentiality</li>
        <li>Not share personal contact information outside the platform</li>
      </ul>

      <h2>4. Content Guidelines</h2>
      <p>You agree not to post content that is:</p>
      <ul>
        <li>Unlawful or harmful</li>
        <li>Harassing or discriminatory</li>
        <li>False or misleading</li>
        <li>Infringing on intellectual property rights</li>
      </ul>

      <h2>5. Termination</h2>
      <p>We reserve the right to terminate or suspend accounts that violate these terms.</p>

      <h2>6. Changes to Terms</h2>
      <p>We may modify these terms at any time. Continued use of the platform constitutes acceptance of modified terms.</p>

      <h2>7. Contact</h2>
      <p>For questions about these terms, please contact us.</p>
    </div>
  );
}