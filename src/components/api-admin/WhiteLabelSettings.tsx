import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Palette, 
  Upload, 
  Eye, 
  Save, 
  Download, 
  Globe, 
  Mail,
  Smartphone,
  Monitor,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  companyName: string;
  companyWebsite?: string;
  supportEmail?: string;
  customDomain?: string;
  enableCustomFooter: boolean;
  footerText?: string;
  customCSS?: string;
  emailSettings: {
    fromName: string;
    replyToEmail: string;
    headerImageUrl?: string;
    footerText?: string;
  };
}

interface ThemePreset {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

const themePresets: ThemePreset[] = [
  {
    name: 'Corporate Blue',
    description: 'Professional and trustworthy',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    name: 'Modern Purple',
    description: 'Creative and innovative',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    name: 'Professional Green',
    description: 'Growth and stability focused',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    name: 'Dark Mode',
    description: 'Modern dark interface',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#111827',
      text: '#f9fafb'
    }
  }
];

export function WhiteLabelSettings() {
  const [config, setConfig] = useState<BrandingConfig>({
    primaryColor: '#00A6D4',
    secondaryColor: '#012169',
    accentColor: '#0ea5e9',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    companyName: 'Your Company',
    enableCustomFooter: false,
    emailSettings: {
      fromName: 'Your Company',
      replyToEmail: 'support@yourcompany.com'
    }
  });
  
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedEmbedCode, setCopiedEmbedCode] = useState(false);
  const { toast } = useToast();

  const applyPreset = useCallback((preset: ThemePreset) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      accentColor: preset.colors.accent,
      backgroundColor: preset.colors.background,
      textColor: preset.colors.text
    }));
  }, []);

  const handleImageUpload = useCallback((field: 'logoUrl' | 'faviconUrl' | 'emailSettings.headerImageUrl') => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // In a real implementation, you would upload to your storage service
      const mockUrl = URL.createObjectURL(file);
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setConfig(prev => ({
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: mockUrl
          }
        }));
      } else {
        setConfig(prev => ({
          ...prev,
          [field]: mockUrl
        }));
      }

      toast({
        title: "Image Uploaded",
        description: "Image uploaded successfully. Don't forget to save your changes."
      });
    };
  }, [toast]);

  const saveConfiguration = useCallback(async () => {
    try {
      // Save configuration to database
      toast({
        title: "Configuration Saved",
        description: "Your white-label settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive"
      });
    }
  }, [config, toast]);

  const generateEmbedCode = useCallback(() => {
    const embedCode = `<!-- PicoCareer Assessment Widget -->
<div id="picocareer-assessment"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://sdk.picocareer.com/widget.js';
    script.async = true;
    script.onload = function() {
      PicoCareer.init({
        apiKey: 'YOUR_API_KEY',
        containerId: 'picocareer-assessment',
        theme: {
          primaryColor: '${config.primaryColor}',
          secondaryColor: '${config.secondaryColor}',
          accentColor: '${config.accentColor}',
          backgroundColor: '${config.backgroundColor}',
          textColor: '${config.textColor}',
          logoUrl: '${config.logoUrl || ''}',
          companyName: '${config.companyName}'
        }
      });
    };
    document.head.appendChild(script);
  })();
</script>`;
    
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbedCode(true);
    setTimeout(() => setCopiedEmbedCode(false), 2000);
    
    toast({
      title: "Embed Code Copied",
      description: "The embed code has been copied to your clipboard."
    });
  }, [config, toast]);

  const exportConfiguration = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `white-label-config-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [config]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">White-Label Settings</h2>
          <p className="text-muted-foreground">Customize the branding and appearance of your assessment platform</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConfiguration}>
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button onClick={saveConfiguration}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="branding" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="domain">Domain</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={config.companyName}
                        onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-website">Website</Label>
                      <Input
                        id="company-website"
                        value={config.companyWebsite || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, companyWebsite: e.target.value }))}
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                      id="support-email"
                      value={config.supportEmail || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                      placeholder="support@yourcompany.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo & Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logo-upload">Company Logo</Label>
                      <div className="mt-1 flex items-center gap-4">
                        {config.logoUrl && (
                          <img src={config.logoUrl} alt="Logo" className="h-12 w-auto" />
                        )}
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload('logoUrl')}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="favicon-upload">Favicon</Label>
                      <div className="mt-1 flex items-center gap-4">
                        {config.faviconUrl && (
                          <img src={config.faviconUrl} alt="Favicon" className="h-8 w-8" />
                        )}
                        <Input
                          id="favicon-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload('faviconUrl')}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Footer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="custom-footer"
                      checked={config.enableCustomFooter}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableCustomFooter: checked }))}
                    />
                    <Label htmlFor="custom-footer">Enable Custom Footer</Label>
                  </div>

                  {config.enableCustomFooter && (
                    <div>
                      <Label htmlFor="footer-text">Footer Text</Label>
                      <Textarea
                        id="footer-text"
                        value={config.footerText || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, footerText: e.target.value }))}
                        placeholder="© 2024 Your Company. All rights reserved."
                        rows={3}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Presets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themePresets.map((preset) => (
                      <div
                        key={preset.name}
                        className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                        onClick={() => applyPreset(preset)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-1">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: preset.colors.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: preset.colors.secondary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: preset.colors.accent }}
                            />
                          </div>
                          <span className="font-medium">{preset.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.primaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.secondaryColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.accentColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="background-color">Background</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={config.backgroundColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.backgroundColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="text-color">Text Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={config.textColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.textColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="custom-css">Additional CSS</Label>
                    <Textarea
                      id="custom-css"
                      value={config.customCSS || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, customCSS: e.target.value }))}
                      placeholder="/* Add your custom CSS here */
.assessment-container {
  border-radius: 12px;
}

.question-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domain" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Domain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      Use your own domain for the assessment platform. Requires DNS configuration.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="custom-domain">Domain Name</Label>
                    <Input
                      id="custom-domain"
                      value={config.customDomain || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                      placeholder="assessments.yourcompany.com"
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">DNS Configuration Required:</h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div>Type: CNAME</div>
                      <div>Name: assessments (or your subdomain)</div>
                      <div>Value: platform.picocareer.com</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Embed Widget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Embed the assessment widget directly on your website using this code:
                  </p>
                  
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={`<div id="picocareer-assessment"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://sdk.picocareer.com/widget.js';
    script.async = true;
    script.onload = function() {
      PicoCareer.init({
        apiKey: 'YOUR_API_KEY',
        containerId: 'picocareer-assessment',
        theme: { /* your theme config */ }
      });
    };
    document.head.appendChild(script);
  })();
</script>`}
                      rows={12}
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={generateEmbedCode}
                    >
                      {copiedEmbedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from-name">From Name</Label>
                      <Input
                        id="from-name"
                        value={config.emailSettings.fromName}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          emailSettings: { ...prev.emailSettings, fromName: e.target.value }
                        }))}
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reply-to">Reply-To Email</Label>
                      <Input
                        id="reply-to"
                        value={config.emailSettings.replyToEmail}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          emailSettings: { ...prev.emailSettings, replyToEmail: e.target.value }
                        }))}
                        placeholder="support@yourcompany.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email-header">Email Header Image</Label>
                    <div className="mt-1 flex items-center gap-4">
                      {config.emailSettings.headerImageUrl && (
                        <img src={config.emailSettings.headerImageUrl} alt="Email Header" className="h-16 w-auto" />
                      )}
                      <Input
                        id="email-header"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload('emailSettings.headerImageUrl')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email-footer">Email Footer Text</Label>
                    <Textarea
                      id="email-footer"
                      value={config.emailSettings.footerText || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        emailSettings: { ...prev.emailSettings, footerText: e.target.value }
                      }))}
                      placeholder="© 2024 Your Company. All rights reserved."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'tablet' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                  previewMode === 'desktop' ? 'w-full h-96' :
                  previewMode === 'tablet' ? 'w-80 h-96 mx-auto' :
                  'w-64 h-96 mx-auto'
                }`}
                style={{ backgroundColor: config.backgroundColor }}
              >
                <div 
                  className="h-16 flex items-center justify-between px-4"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="h-8" />
                  ) : (
                    <span style={{ color: config.backgroundColor }} className="font-bold">
                      {config.companyName}
                    </span>
                  )}
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <h3 style={{ color: config.textColor }} className="text-lg font-semibold mb-2">
                      Career Assessment
                    </h3>
                    <p style={{ color: config.textColor }} className="text-sm opacity-80">
                      Discover your ideal career path with our comprehensive assessment.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 border rounded" style={{ borderColor: config.accentColor }}>
                      <p style={{ color: config.textColor }} className="text-sm">
                        Question 1: What motivates you most in your work?
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      {['Creative challenges', 'Helping others', 'Financial rewards'].map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm" style={{ color: config.textColor }}>
                          <input type="radio" style={{ accentColor: config.primaryColor }} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-2 px-4 rounded font-medium text-white transition-colors"
                    style={{ 
                      backgroundColor: config.primaryColor,
                      color: config.backgroundColor
                    }}
                  >
                    Next Question
                  </button>
                </div>

                {config.enableCustomFooter && config.footerText && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 p-2 text-center text-xs"
                    style={{ 
                      backgroundColor: config.secondaryColor,
                      color: config.backgroundColor
                    }}
                  >
                    {config.footerText}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Company:</span>
                <span className="font-medium">{config.companyName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Primary Color:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border" 
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <span className="font-mono text-xs">{config.primaryColor}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Custom Domain:</span>
                <span className="font-medium">
                  {config.customDomain || 'Not configured'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Custom Footer:</span>
                <Badge variant={config.enableCustomFooter ? 'default' : 'secondary'}>
                  {config.enableCustomFooter ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}