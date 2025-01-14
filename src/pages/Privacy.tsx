import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: January 12, 2025</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Introduction Card */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            This privacy policy ("Privacy Policy") applies to the personal information that PicoCareer processes 
            in connection with PicoCareer apps, websites, software, and related services (the "Platform"), 
            that link to or reference this Privacy Policy.
          </p>
        </Card>

        {/* Main Content Area */}
        <ScrollArea className="h-[calc(100vh-300px)] rounded-lg border">
          <div className="p-6 space-y-8">
            {/* Information Collection Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">What Information We Collect</h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <p className="text-gray-600">
                  We collect your information in three ways: Information You Provide, Automatically Collected Information, 
                  and Information From Other Sources. More detail is provided below.
                </p>

                {/* Information You Provide */}
                <div>
                  <h3 className="text-xl font-medium mb-4">Information You Provide</h3>
                  <div className="space-y-4">
                    {/* Each information type in a card */}
                    {[
                      {
                        title: "Profile Information",
                        content: "We collect information that you provide when you set up an account, such as your username, email address and/or telephone number, and password. You can add other information to your profile, such as a bio or a profile photo."
                      },
                      {
                        title: "User Content",
                        content: "We collect the content you create or publish through the Platform, such as photographs, videos, audio recordings, livestreams, comments, hashtags, feedback, reviews, and the associated metadata (such as when, where, and by whom the content was created)."
                      },
                      // ... Continue with all other sections
                    ].map((item, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-medium mb-2">{item.title}</h4>
                        <p className="text-gray-600">{item.content}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Continue with all other sections */}
                {/* Each major section should be wrapped in a div with appropriate spacing */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium mb-4">Automatically Collected Information</h3>
                  {/* Technical Information, Location Information, etc. */}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-medium mb-4">Service Providers</h3>
                  {/* Service Providers content */}
                </div>

                {/* Continue with all other sections */}
                {/* Each section should maintain consistent styling and spacing */}
              </div>
            </section>

            <Separator />

            {/* Rights and Choices Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Your Rights and Choices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rights cards */}
                {/* Each right should be in its own card with consistent styling */}
              </div>
            </section>

            <Separator />

            {/* Security and Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Data Security and Retention</h2>
              {/* Security and retention content */}
            </section>

            <Separator />

            {/* Global Operations */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Our Global Operations and Data Transfers</h2>
              {/* Global operations content */}
            </section>

            <Separator />

            {/* Updates Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Privacy Policy Updates</h2>
              {/* Updates content */}
            </section>
          </div>
        </ScrollArea>

        {/* Contact Section */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Questions About Our Privacy Policy?</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us through our support channels.
          </p>
        </Card>
      </div>
    </div>
  );
}