import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 12, 2025</p>
        </div>

        <Card className="p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            This privacy policy ("Privacy Policy") applies to the personal information that PicoCareer processes 
            in connection with PicoCareer apps, websites, software, and related services (the "Platform"), 
            that link to or reference this Privacy Policy.
          </p>
        </Card>

        <ScrollArea className="h-[600px] rounded-md border p-6">
          <div className="space-y-8">
            {/* Information Collection Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">What Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect your information in three ways: Information You Provide, Automatically Collected Information, 
                and Information From Other Sources.
              </p>
              
              <div className="space-y-4 pl-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Information You Provide</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Profile Information (username, email, phone number, password)</li>
                    <li>User Content (photographs, videos, audio recordings, comments)</li>
                    <li>Direct Messages</li>
                    <li>Contact Information</li>
                    <li>Purchase Information</li>
                    <li>Survey and Research Responses</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Automatically Collected Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Automatically Collected Information</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Technical Information</h3>
                  <p className="text-gray-600">
                    Device model, operating system, IP address, system language, and performance logs.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Location Information</h3>
                  <p className="text-gray-600">
                    Approximate location based on IP address and device settings.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Usage Information</h3>
                  <p className="text-gray-600">
                    Content views, engagement metrics, search history, and platform settings.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Service Providers Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Service Providers</h2>
              <p className="text-gray-600 mb-4">
                We engage service providers that help us provide, support, and develop the Platform and 
                understand how it is used.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Cloud hosting providers</li>
                <li>Content delivery networks</li>
                <li>Customer and technical support</li>
                <li>Content moderation services</li>
                <li>Marketing and analytics providers</li>
                <li>Payment processors</li>
              </ul>
            </section>

            <Separator />

            {/* Your Rights Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights and Choices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Access Your Data</h3>
                  <p className="text-gray-600">Request a copy of your personal information</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Delete Your Data</h3>
                  <p className="text-gray-600">Request deletion of your personal information</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Update Your Data</h3>
                  <p className="text-gray-600">Correct or update your personal information</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Control Your Privacy</h3>
                  <p className="text-gray-600">Manage your privacy settings and preferences</p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Contact Section */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Questions About Our Privacy Policy?</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us through our support channels.
          </p>
        </Card>
      </div>
    </div>
  );
}