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
                <div className="space-y-6">
                  <h3 className="text-xl font-medium mb-4">Information You Provide</h3>
                  <div className="grid gap-6">
                    {[
                      {
                        title: "Profile Information",
                        content: "We collect information that you provide when you set up an account, such as your username, email address and/or telephone number, and password. You can add other information to your profile, such as a bio or a profile photo."
                      },
                      {
                        title: "User Content",
                        content: "We collect the content you create or publish through the Platform, such as photographs, videos, audio recordings, livestreams, comments, hashtags, feedback, reviews, and the associated metadata."
                      },
                      {
                        title: "Direct Messages",
                        content: "If you communicate with others using direct messages, we collect the content of the message and the associated metadata."
                      },
                      {
                        title: "Your Contacts",
                        content: "If you choose to sync your contacts, we will collect information from your device's phone book."
                      },
                      {
                        title: "Purchase Information",
                        content: "When you make a purchase or payment on or through the Platform, we collect information about the transaction."
                      }
                    ].map((item, index) => (
                      <Card key={index} className="p-6">
                        <h4 className="font-medium text-lg mb-2">{item.title}</h4>
                        <p className="text-gray-600">{item.content}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Automatically Collected Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium mb-4">Automatically Collected Information</h3>
                  <div className="grid gap-6">
                    {[
                      {
                        title: "Technical Information",
                        content: "We collect device and network connection information when you access the Platform."
                      },
                      {
                        title: "Location Information",
                        content: "We automatically collect information about your approximate location based on your Technical Information."
                      },
                      {
                        title: "Usage Information",
                        content: "We collect information about how you engage with the Platform."
                      },
                      {
                        title: "Content Characteristics",
                        content: "We detect and collect characteristics and features about the videos, images, and audio recordings."
                      }
                    ].map((item, index) => (
                      <Card key={index} className="p-6">
                        <h4 className="font-medium text-lg mb-2">{item.title}</h4>
                        <p className="text-gray-600">{item.content}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Usage Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">How We Use Your Information</h2>
              <div className="grid gap-6">
                {[
                  {
                    title: "Service Providers",
                    content: "We engage service providers that help us provide, support, and develop the Platform."
                  },
                  {
                    title: "Partners",
                    content: "We share limited information with third party platforms and partners whose services are integrated with the Platform."
                  },
                  {
                    title: "Our Corporate Group",
                    content: "As a global company, the Platform is supported by certain entities within our corporate group."
                  }
                ].map((item, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* Your Rights Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Your Rights and Choices</h2>
              <div className="grid gap-6">
                {[
                  {
                    title: "Access Your Information",
                    content: "You can request access to your information free of charge."
                  },
                  {
                    title: "Delete Your Information",
                    content: "You can delete or request deletion of your information."
                  },
                  {
                    title: "Control Your Privacy",
                    content: "You can control your privacy settings and manage your data."
                  }
                ].map((item, index) => (
                  <Card key={index} className="p-6 bg-gray-50">
                    <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* Security and Updates Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Security and Updates</h2>
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2">Data Security</h3>
                    <p className="text-gray-600">
                      We maintain appropriate technical, administrative, and physical security measures to protect your information.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">Policy Updates</h3>
                    <p className="text-gray-600">
                      We may update this Privacy Policy from time to time and will notify you of any material changes.
                    </p>
                  </div>
                </div>
              </Card>
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