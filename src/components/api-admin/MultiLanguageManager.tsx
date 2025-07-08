import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Globe, Download, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  isActive: boolean;
  completeness: number;
}

interface Translation {
  id: string;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
  context?: string;
  updated_at: string;
}

interface TranslationImport {
  file: File;
  language_code: string;
  namespace: string;
}

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false, isActive: true, completeness: 100 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false, isActive: false, completeness: 0 },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, isActive: false, completeness: 0 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false, isActive: false, completeness: 0 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false, isActive: false, completeness: 0 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRTL: false, isActive: false, completeness: 0 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false, isActive: false, completeness: 0 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false, isActive: false, completeness: 0 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true, isActive: false, completeness: 0 },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true, isActive: false, completeness: 0 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRTL: false, isActive: false, completeness: 0 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false, isActive: false, completeness: 0 },
];

const translationNamespaces = [
  { value: 'assessments', label: 'Assessment Questions' },
  { value: 'ui', label: 'User Interface' },
  { value: 'emails', label: 'Email Templates' },
  { value: 'errors', label: 'Error Messages' },
  { value: 'notifications', label: 'Notifications' },
];

export function MultiLanguageManager() {
  const [languages, setLanguages] = useState<Language[]>(supportedLanguages);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedNamespace, setSelectedNamespace] = useState('assessments');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const { toast } = useToast();

  const [newTranslation, setNewTranslation] = useState({
    key: '',
    value: '',
    context: ''
  });

  const [importData, setImportData] = useState<TranslationImport>({
    file: null as any,
    language_code: '',
    namespace: 'assessments'
  });

  useEffect(() => {
    fetchTranslations();
  }, [selectedLanguage, selectedNamespace]);

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      // Mock data for demo - in real implementation, this would fetch from the database
      const mockTranslations: Translation[] = [
        {
          id: '1',
          language_code: selectedLanguage,
          namespace: selectedNamespace,
          key: 'welcome_message',
          value: selectedLanguage === 'en' ? 'Welcome to your career assessment' : 'Bienvenido a tu evaluación profesional',
          context: 'Greeting shown at the start of assessments',
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          language_code: selectedLanguage,
          namespace: selectedNamespace,
          key: 'continue_button',
          value: selectedLanguage === 'en' ? 'Continue' : 'Continuar',
          context: 'Button to proceed to next question',
          updated_at: new Date().toISOString()
        }
      ];
      
      setTranslations(mockTranslations);
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch translations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!newTranslation.key || !newTranslation.value) {
      toast({
        title: "Error",
        description: "Key and value are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock save operation
      const newEntry: Translation = {
        id: Date.now().toString(),
        language_code: selectedLanguage,
        namespace: selectedNamespace,
        key: newTranslation.key,
        value: newTranslation.value,
        context: newTranslation.context,
        updated_at: new Date().toISOString()
      };

      setTranslations([...translations, newEntry]);
      setNewTranslation({ key: '', value: '', context: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Translation saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save translation",
        variant: "destructive",
      });
    }
  };

  const handleImportTranslations = async () => {
    if (!importData.file || !importData.language_code) {
      toast({
        title: "Error",
        description: "Please select a file and language",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = await importData.file.text();
      const importedData = JSON.parse(fileContent);
      
      // Process imported translations
      const newTranslations: Translation[] = Object.entries(importedData).map(([key, value]) => ({
        id: Date.now().toString() + Math.random(),
        language_code: importData.language_code,
        namespace: importData.namespace,
        key,
        value: value as string,
        updated_at: new Date().toISOString()
      }));

      setTranslations([...translations, ...newTranslations]);
      setIsImportDialogOpen(false);
      setImportData({ file: null as any, language_code: '', namespace: 'assessments' });
      
      toast({
        title: "Success",
        description: `Imported ${newTranslations.length} translations`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import translations. Please check file format.",
        variant: "destructive",
      });
    }
  };

  const exportTranslations = () => {
    const exportData = translations.reduce((acc, translation) => {
      acc[translation.key] = translation.value;
      return acc;
    }, {} as Record<string, string>);

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations_${selectedLanguage}_${selectedNamespace}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Translations exported successfully",
    });
  };

  const toggleLanguage = (languageCode: string) => {
    setLanguages(languages.map(lang => 
      lang.code === languageCode 
        ? { ...lang, isActive: !lang.isActive }
        : lang
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Multi-Language Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage translations and language settings for global deployment
          </p>
        </div>
      </div>

      <Tabs defaultValue="languages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
              <CardDescription>
                Enable or disable languages for your assessment platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((language) => (
                  <div
                    key={language.code}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {language.nativeName} ({language.code})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {language.completeness}% complete
                          {language.isRTL && " • RTL"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={language.isActive ? "default" : "secondary"}>
                        {language.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLanguage(language.code)}
                      >
                        {language.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.filter(lang => lang.isActive).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {translationNamespaces.map((ns) => (
                    <SelectItem key={ns.value} value={ns.value}>
                      {ns.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Translation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Translation</DialogTitle>
                  <DialogDescription>
                    Add a new translation for {selectedLanguage} in {selectedNamespace}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Translation Key</Label>
                    <Input
                      value={newTranslation.key}
                      onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
                      placeholder="e.g., welcome_message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Translation Value</Label>
                    <Textarea
                      value={newTranslation.value}
                      onChange={(e) => setNewTranslation({ ...newTranslation, value: e.target.value })}
                      placeholder="Enter the translated text"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Context (Optional)</Label>
                    <Input
                      value={newTranslation.context}
                      onChange={(e) => setNewTranslation({ ...newTranslation, context: e.target.value })}
                      placeholder="Description of where this translation is used"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTranslation}>
                    Save Translation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">Loading translations...</div>
              ) : (
                <div className="space-y-1">
                  {translations.map((translation) => (
                    <div
                      key={translation.id}
                      className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{translation.key}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {translation.value}
                        </div>
                        {translation.context && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {translation.context}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTranslation(translation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTranslations(translations.filter(t => t.id !== translation.id));
                            toast({ title: "Translation deleted" });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {translations.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No translations found for this language and namespace
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Translations</CardTitle>
                <CardDescription>
                  Download translations as JSON files for external editing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.filter(lang => lang.isActive).map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {translationNamespaces.map((ns) => (
                        <SelectItem key={ns.value} value={ns.value}>
                          {ns.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={exportTranslations} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Translations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Translations</CardTitle>
                <CardDescription>
                  Upload JSON files with translation data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Translations
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Translations</DialogTitle>
                      <DialogDescription>
                        Upload a JSON file with translation key-value pairs
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={importData.language_code}
                          onValueChange={(value) => setImportData({ ...importData, language_code: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.filter(lang => lang.isActive).map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Namespace</Label>
                        <Select
                          value={importData.namespace}
                          onValueChange={(value) => setImportData({ ...importData, namespace: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {translationNamespaces.map((ns) => (
                              <SelectItem key={ns.value} value={ns.value}>
                                {ns.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Translation File</Label>
                        <Input
                          type="file"
                          accept=".json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImportData({ ...importData, file });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleImportTranslations}>
                        Import
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}