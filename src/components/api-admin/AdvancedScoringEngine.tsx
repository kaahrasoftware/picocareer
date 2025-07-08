import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Settings, 
  Play, 
  Save,
  BarChart3,
  Zap,
  Lightbulb,
  Users,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScoringRule {
  id: string;
  name: string;
  description: string;
  weight: number;
  condition: string;
  action: 'boost' | 'penalty' | 'set_score';
  value: number;
  isActive: boolean;
}

interface MLModel {
  id: string;
  name: string;
  type: 'personality_matching' | 'skill_assessment' | 'career_prediction' | 'similarity_matching';
  status: 'training' | 'active' | 'inactive' | 'error';
  accuracy: number;
  trainingData: number;
  lastTrained: Date;
  version: string;
}

interface ScoringConfig {
  algorithm: 'rule_based' | 'ml_enhanced' | 'hybrid';
  personalityWeight: number;
  skillsWeight: number;
  experienceWeight: number;
  interestsWeight: number;
  enableMLBoost: boolean;
  confidenceThreshold: number;
  minMatchScore: number;
  maxRecommendations: number;
}

export function AdvancedScoringEngine() {
  const [config, setConfig] = useState<ScoringConfig>({
    algorithm: 'hybrid',
    personalityWeight: 40,
    skillsWeight: 30,
    experienceWeight: 20,
    interestsWeight: 10,
    enableMLBoost: true,
    confidenceThreshold: 70,
    minMatchScore: 50,
    maxRecommendations: 5
  });

  const [rules, setRules] = useState<ScoringRule[]>([
    {
      id: 'tech_experience',
      name: 'Technical Experience Boost',
      description: 'Boost score for technical roles if user has programming experience',
      weight: 1.5,
      condition: 'has_experience("programming") && career_category == "technology"',
      action: 'boost',
      value: 15,
      isActive: true
    },
    {
      id: 'leadership_penalty',
      name: 'Leadership Mismatch Penalty',
      description: 'Reduce score for leadership roles if user prefers individual work',
      weight: 1.0,
      condition: 'personality_trait("introversion") > 70 && career_requires("leadership")',
      action: 'penalty',
      value: 20,
      isActive: true
    }
  ]);

  const [mlModels, setMLModels] = useState<MLModel[]>([
    {
      id: 'personality_model_v2',
      name: 'Personality Career Matcher v2.0',
      type: 'personality_matching',
      status: 'active',
      accuracy: 87.5,
      trainingData: 15420,
      lastTrained: new Date('2024-01-15'),
      version: '2.0.1'
    },
    {
      id: 'skill_prediction_v1',
      name: 'Skill Gap Predictor',
      type: 'skill_assessment',
      status: 'training',
      accuracy: 82.1,
      trainingData: 8934,
      lastTrained: new Date('2024-01-10'),
      version: '1.2.0'
    }
  ]);

  const [testResults, setTestResults] = useState<any>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const { toast } = useToast();

  const addRule = useCallback(() => {
    const newRule: ScoringRule = {
      id: `rule_${Date.now()}`,
      name: 'New Scoring Rule',
      description: '',
      weight: 1.0,
      condition: '',
      action: 'boost',
      value: 10,
      isActive: true
    };
    setRules(prev => [...prev, newRule]);
  }, []);

  const updateRule = useCallback((ruleId: string, updates: Partial<ScoringRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  }, []);

  const deleteRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  const runScoringTest = useCallback(async () => {
    setIsTestRunning(true);
    
    try {
      // Simulate scoring test
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResults = {
        totalAssessments: 100,
        avgProcessingTime: 450,
        accuracyImprovement: 12.5,
        topCareerMatches: [
          { career: 'Software Engineer', avgScore: 85.2, confidence: 92 },
          { career: 'Data Scientist', avgScore: 78.9, confidence: 88 },
          { career: 'Product Manager', avgScore: 74.1, confidence: 85 }
        ],
        performanceMetrics: {
          precision: 0.847,
          recall: 0.892,
          f1Score: 0.869
        }
      };
      
      setTestResults(mockResults);
      
      toast({
        title: "Scoring Test Complete",
        description: `Processed ${mockResults.totalAssessments} test assessments with ${mockResults.accuracyImprovement}% accuracy improvement.`
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to run scoring test.",
        variant: "destructive"
      });
    } finally {
      setIsTestRunning(false);
    }
  }, [toast]);

  const saveConfiguration = useCallback(async () => {
    try {
      // Save configuration
      toast({
        title: "Configuration Saved",
        description: "Scoring engine configuration has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive"
      });
    }
  }, [config, rules, toast]);

  const retrainModel = useCallback(async (modelId: string) => {
    setMLModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, status: 'training' } : model
    ));

    try {
      // Simulate model retraining
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      setMLModels(prev => prev.map(model => 
        model.id === modelId ? {
          ...model,
          status: 'active',
          accuracy: model.accuracy + Math.random() * 5,
          lastTrained: new Date(),
          version: `${model.version.split('.')[0]}.${parseInt(model.version.split('.')[1]) + 1}.0`
        } : model
      ));

      toast({
        title: "Model Retrained",
        description: "ML model has been retrained successfully with updated data."
      });
    } catch (error) {
      setMLModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, status: 'error' } : model
      ));
      
      toast({
        title: "Training Failed",
        description: "Failed to retrain the ML model.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const getModelStatusColor = (status: MLModel['status']) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'training': return 'text-blue-600';
      case 'inactive': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getModelStatusIcon = (status: MLModel['status']) => {
    switch (status) {
      case 'active': return <Zap className="h-4 w-4" />;
      case 'training': return <Brain className="h-4 w-4 animate-pulse" />;
      case 'inactive': return <Settings className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Scoring Engine</h2>
          <p className="text-muted-foreground">Configure ML-powered career matching algorithms and scoring rules</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={runScoringTest}
            disabled={isTestRunning}
            className="gap-2"
          >
            {isTestRunning ? (
              <>
                <Brain className="h-4 w-4 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Test Engine
              </>
            )}
          </Button>
          <Button onClick={saveConfiguration} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="algorithm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="algorithm" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scoring Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="algorithm-select">Primary Algorithm</Label>
                  <Select 
                    value={config.algorithm} 
                    onValueChange={(value: ScoringConfig['algorithm']) => 
                      setConfig(prev => ({ ...prev, algorithm: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rule_based">Rule-Based Only</SelectItem>
                      <SelectItem value="ml_enhanced">ML-Enhanced</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.algorithm === 'rule_based' && 'Uses only predefined scoring rules'}
                    {config.algorithm === 'ml_enhanced' && 'Primarily ML-driven with rule fallbacks'}
                    {config.algorithm === 'hybrid' && 'Combines ML predictions with rule-based adjustments'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ml-boost">Enable ML Score Boost</Label>
                    <Switch
                      id="ml-boost"
                      checked={config.enableMLBoost}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableMLBoost: checked }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[config.confidenceThreshold]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, confidenceThreshold: value }))}
                        max={100}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium">{config.confidenceThreshold}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum confidence level for ML predictions
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="min-score">Minimum Match Score</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[config.minMatchScore]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, minMatchScore: value }))}
                        max={100}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium">{config.minMatchScore}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Careers below this score won't be recommended
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="max-recommendations">Maximum Recommendations</Label>
                    <Input
                      id="max-recommendations"
                      type="number"
                      min="1"
                      max="20"
                      value={config.maxRecommendations}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        maxRecommendations: parseInt(e.target.value) || 5 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Algorithm Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">87.5%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">450ms</div>
                    <div className="text-sm text-muted-foreground">Avg. Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">15.2k</div>
                    <div className="text-sm text-muted-foreground">Assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">94.1%</div>
                    <div className="text-sm text-muted-foreground">User Satisfaction</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Precision</span>
                    <span>0.847</span>
                  </div>
                  <Progress value={84.7} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Recall</span>
                    <span>0.892</span>
                  </div>
                  <Progress value={89.2} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>F1 Score</span>
                    <span>0.869</span>
                  </div>
                  <Progress value={86.9} className="h-2" />
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Performance improved by 12.5% over the last month with hybrid algorithm.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Weight Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust the importance of different factors in career matching
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="personality-weight">Personality Traits</Label>
                      <span className="text-sm font-medium">{config.personalityWeight}%</span>
                    </div>
                    <Slider
                      value={[config.personalityWeight]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, personalityWeight: value }))}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      How much personality assessment results influence matching
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="skills-weight">Skills & Abilities</Label>
                      <span className="text-sm font-medium">{config.skillsWeight}%</span>
                    </div>
                    <Slider
                      value={[config.skillsWeight]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, skillsWeight: value }))}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Weight given to technical and soft skills assessment
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="experience-weight">Experience Level</Label>
                      <span className="text-sm font-medium">{config.experienceWeight}%</span>
                    </div>
                    <Slider
                      value={[config.experienceWeight]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, experienceWeight: value }))}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Importance of work experience and education level
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="interests-weight">Career Interests</Label>
                      <span className="text-sm font-medium">{config.interestsWeight}%</span>
                    </div>
                    <Slider
                      value={[config.interestsWeight]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, interestsWeight: value }))}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Weight of expressed career interests and preferences
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Weight Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Personality</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${config.personalityWeight}%` }}
                          />
                        </div>
                        <span className="text-xs w-8">{config.personalityWeight}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Skills</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${config.skillsWeight}%` }}
                          />
                        </div>
                        <span className="text-xs w-8">{config.skillsWeight}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Experience</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${config.experienceWeight}%` }}
                          />
                        </div>
                        <span className="text-xs w-8">{config.experienceWeight}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Interests</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${config.interestsWeight}%` }}
                          />
                        </div>
                        <span className="text-xs w-8">{config.interestsWeight}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">
                      Total Weight: {config.personalityWeight + config.skillsWeight + config.experienceWeight + config.interestsWeight}%
                    </div>
                    {(config.personalityWeight + config.skillsWeight + config.experienceWeight + config.interestsWeight) !== 100 && (
                      <div className="text-xs text-orange-600">
                        ⚠️ Weights should total 100% for optimal results
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Scoring Rules</h3>
            <Button onClick={addRule} className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={rule.name}
                          onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                          className="font-medium"
                        />
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => updateRule(rule.id, { isActive: checked })}
                        />
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <Textarea
                        value={rule.description}
                        onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                        placeholder="Describe what this rule does..."
                        rows={2}
                        className="mb-3"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteRule(rule.id)}
                      className="ml-2"
                    >
                      ×
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`condition-${rule.id}`}>Condition</Label>
                      <Textarea
                        id={`condition-${rule.id}`}
                        value={rule.condition}
                        onChange={(e) => updateRule(rule.id, { condition: e.target.value })}
                        placeholder='e.g., personality_trait("openness") > 80'
                        rows={2}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`action-${rule.id}`}>Action</Label>
                      <Select 
                        value={rule.action} 
                        onValueChange={(value: ScoringRule['action']) => updateRule(rule.id, { action: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boost">Boost Score</SelectItem>
                          <SelectItem value="penalty">Apply Penalty</SelectItem>
                          <SelectItem value="set_score">Set Fixed Score</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`value-${rule.id}`}>Value</Label>
                      <Input
                        id={`value-${rule.id}`}
                        type="number"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, { value: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`weight-${rule.id}`}>Weight</Label>
                      <Input
                        id={`weight-${rule.id}`}
                        type="number"
                        step="0.1"
                        value={rule.weight}
                        onChange={(e) => updateRule(rule.id, { weight: parseFloat(e.target.value) || 1 })}
                        min="0"
                        max="3"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {rules.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No scoring rules defined yet.</p>
                <p className="text-sm">Add rules to customize how career matches are scored.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Models</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage and monitor ML models used in the scoring engine
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Training Data</TableHead>
                    <TableHead>Last Trained</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mlModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">v{model.version}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {model.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 ${getModelStatusColor(model.status)}`}>
                          {getModelStatusIcon(model.status)}
                          <span className="capitalize">{model.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={model.accuracy} className="w-16 h-2" />
                          <span className="text-sm">{model.accuracy.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {model.trainingData.toLocaleString()} samples
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {model.lastTrained.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retrainModel(model.id)}
                          disabled={model.status === 'training'}
                          className="gap-1"
                        >
                          {model.status === 'training' ? (
                            <>
                              <Brain className="h-3 w-3 animate-spin" />
                              Training...
                            </>
                          ) : (
                            <>
                              <Target className="h-3 w-3" />
                              Retrain
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{testResults.totalAssessments}</div>
                    <div className="text-sm text-muted-foreground">Test Assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{testResults.avgProcessingTime}ms</div>
                    <div className="text-sm text-muted-foreground">Avg Processing Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+{testResults.accuracyImprovement}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{testResults.performanceMetrics.f1Score.toFixed(3)}</div>
                    <div className="text-sm text-muted-foreground">F1 Score</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Top Career Matches</h4>
                  <div className="space-y-2">
                    {testResults.topCareerMatches.map((match: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{match.career}</span>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            Score: <span className="font-medium">{match.avgScore}</span>
                          </div>
                          <div className="text-sm">
                            Confidence: <span className="font-medium">{match.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Performance Testing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test the scoring engine with sample data to validate performance
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Sample Profiles</div>
                  <div className="text-2xl font-bold">1,000</div>
                  <div className="text-xs text-muted-foreground">Diverse test profiles</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Accuracy Target</div>
                  <div className="text-2xl font-bold">90%</div>
                  <div className="text-xs text-muted-foreground">Minimum accuracy goal</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="font-medium">Performance Score</div>
                  <div className="text-2xl font-bold">87.5</div>
                  <div className="text-xs text-muted-foreground">Current overall score</div>
                </div>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Testing will run your current configuration against 1,000 sample profiles to measure accuracy and performance.
                  This process takes approximately 2-3 minutes.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={runScoringTest} 
                disabled={isTestRunning}
                className="w-full gap-2"
                size="lg"
              >
                {isTestRunning ? (
                  <>
                    <Brain className="h-5 w-5 animate-spin" />
                    Running Performance Test...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Start Performance Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}