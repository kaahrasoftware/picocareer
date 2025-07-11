import { useState } from 'react';
import { PDFExportService } from '@/services/pdfExportService';
import { PDFExportData, PDFGenerationOptions } from '@/types/pdf';
import { CareerRecommendation, QuestionResponse } from '@/types/assessment';
import { useToast } from '@/hooks/use-toast';

interface UsePdfExportProps {
  assessmentId?: string | null;
  detectedProfileType?: string | null;
}

export const usePdfExport = ({ assessmentId, detectedProfileType }: UsePdfExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPdf = async (
    recommendations: CareerRecommendation[],
    responses: QuestionResponse[],
    options: PDFGenerationOptions = {}
  ) => {
    if (!recommendations.length) {
      toast({
        title: "No data to export",
        description: "Please complete an assessment first to generate a PDF report.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const exportData: PDFExportData = {
        assessmentId: assessmentId || crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        detectedProfileType,
        recommendations: recommendations.map(rec => ({
          title: rec.title,
          description: rec.description,
          matchScore: rec.matchScore,
          reasoning: rec.reasoning,
          salaryRange: rec.salaryRange,
          growthOutlook: rec.growthOutlook,
          timeToEntry: rec.timeToEntry,
          requiredSkills: rec.requiredSkills,
          educationRequirements: rec.educationRequirements,
          workEnvironment: rec.workEnvironment,
        })),
        responses: responses.map(response => ({
          questionId: response.questionId,
          answer: response.answer,
          timestamp: response.timestamp,
        })),
      };

      const pdfService = new PDFExportService();
      await pdfService.generatePDF(exportData, {
        includeResponses: true,
        includeFullDetails: true,
        companyBranding: {
          name: 'PicoCareer',
          website: 'www.picocareer.com',
        },
        ...options,
      });

      toast({
        title: "PDF exported successfully!",
        description: "Your career assessment results have been downloaded.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPdf,
    isExporting,
  };
};