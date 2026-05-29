import { useState, useEffect } from 'react';
import { User, Progress, OutlineSection } from '../../types';
import { supabase } from '../../lib/supabase';
import { Edit2, RefreshCw, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PDFBuilderTabProps {
  user: User;
  progress: Progress | null;
  onProgressUpdate: () => void;
}

type Step = 'title' | 'generating-outline' | 'outline' | 'generating-pdf' | 'complete';

export default function PDFBuilderTab({ user, progress, onProgressUpdate }: PDFBuilderTabProps) {
  const [step, setStep] = useState<Step>('title');
  const [title, setTitle] = useState(user.product_title || '');
  const [outline, setOutline] = useState<OutlineSection[]>([]);
  const [regenerations, setRegenerations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(10);
  const [pdfContent, setPdfContent] = useState<string[]>([]);

  useEffect(() => {
    if (progress?.pdf_outline_approved) {
      setStep('outline');
      fetchOutline();
    }
  }, [progress]);

  const fetchOutline = async () => {
    const { data } = await supabase
      .from('pdf_outlines')
      .select('outline')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.outline) {
      setOutline(data.outline as OutlineSection[]);
    }
  };

  const generateOutline = async () => {
    setLoading(true);
    setError('');
    setStep('generating-outline');

    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf-outline', {
        body: {
          title,
          topic: user.topic,
          audience: user.audience,
        },
      });

      if (error) throw error;

      setOutline(data.outline);
      setStep('outline');

      // Save outline
      await supabase.from('pdf_outlines').insert({
        user_id: user.id,
        outline: data.outline,
      });
    } catch (err) {
      console.error('Error generating outline:', err);
      setError('Something went wrong — tap to try again');
      setStep('title');
    } finally {
      setLoading(false);
    }
  };

  const regenerateOutline = async () => {
    if (regenerations >= 2) return;
    setRegenerations(regenerations + 1);
    await generateOutline();
  };

  const approveOutline = async () => {
    await supabase
      .from('progress')
      .update({ pdf_outline_approved: true })
      .eq('user_id', user.id);

    onProgressUpdate();
    generatePDF();
  };

  const generatePDF = async () => {
    setLoading(true);
    setError('');
    setStep('generating-pdf');
    setTotalSections(outline.length);
    const content: string[] = [];

    try {
      for (let i = 0; i < outline.length; i++) {
        setCurrentSection(i + 1);

        const { data, error } = await supabase.functions.invoke('generate-pdf-section', {
          body: {
            sectionNumber: i + 1,
            section: outline[i],
            title,
            topic: user.topic,
            audience: user.audience,
          },
        });

        if (error) throw error;

        content.push(data.content);
      }

      setPdfContent(content);
      setStep('complete');

      await supabase
        .from('progress')
        .update({ pdf_downloaded: true })
        .eq('user_id', user.id);

      onProgressUpdate();
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Something went wrong — tap to try again');
      setStep('outline');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Cover page
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(201, 168, 76);
    doc.setFontSize(24);
    const titleLines = doc.splitTextToSize(title, maxWidth);
    let titleY = pageHeight / 2 - 20;
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, titleY, { align: 'center' });
      titleY += 12;
    });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('A Complete Beginner\'s Guide', pageWidth / 2, titleY + 20, { align: 'center' });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text('Created with Build & Launch System · hania.cc', pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Content pages
    let currentPage = 1;
    let currentY = margin;

    const addNewPage = () => {
      currentPage++;
      doc.addPage();
      currentY = margin;
    };

    pdfContent.forEach((section, index) => {
      if (index > 0) addNewPage();

      const sectionTitle = outline[index]?.title || `Section ${index + 1}`;

      // Section title with gold underline
      doc.setTextColor(28, 28, 28);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(sectionTitle, margin, currentY);
      currentY += 2;
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(1);
      doc.line(margin, currentY, margin + 50, currentY);
      currentY += 10;

      // Section content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(28, 28, 28);

      const lines = doc.splitTextToSize(section, maxWidth);
      lines.forEach((line: string) => {
        if (currentY > pageHeight - margin - 20) {
          addNewPage();
        }
        doc.text(line, margin, currentY);
        currentY += 6;
      });

      // Footer
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(user.brand_handle, margin, pageHeight - 10);
      doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    });

    doc.download(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  const startOver = () => {
    setStep('title');
    setOutline([]);
    setPdfContent([]);
    setRegenerations(0);
    setCurrentSection(0);
  };

  if (step === 'generating-outline' || step === 'generating-pdf') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-lg text-gray-600 mb-2">
          {step === 'generating-outline'
            ? 'Building your outline... about 10 seconds'
            : `Writing your PDF... Section ${currentSection} of ${totalSections}`}
        </p>
        {step === 'generating-pdf' && (
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#C9A84C] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / totalSections) * 100}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => setStep('title')}
          className="bg-[#C9A84C] text-[#1A1A1A] font-semibold py-2 px-6 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your PDF is ready!</h2>
          <p className="text-gray-600 mb-6">Download it and start selling.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={downloadPDF}
            className="bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-6 rounded-lg hover:bg-[#B8963B] transition-colors flex items-center justify-center gap-2"
          >
            Download My PDF
          </button>
          <button
            onClick={startOver}
            className="border border-[#C9A84C] text-[#C9A84C] font-semibold py-3 px-6 rounded-lg hover:bg-[#FBF6ED] transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (step === 'outline' && outline.length > 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Your PDF Outline</h2>

        <div className="space-y-4">
          {outline.map((section, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {index + 1}. {section.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{section.description}</p>
              <ul className="space-y-1">
                {section.bullets.map((bullet, i) => (
                  <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className="text-[#C9A84C] mt-1">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={approveOutline}
            className="flex-1 bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-6 rounded-lg hover:bg-[#B8963B] transition-colors"
          >
            Looks good - Write My PDF
          </button>
          {regenerations < 3 && (
            <button
              onClick={regenerateOutline}
              disabled={loading}
              className="border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Different Outline
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Builder</h2>
        <p className="text-gray-600">Let's create your digital product.</p>
      </div>

      <div className="border-2 border-[#C9A84C] rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title ? (
              <p className="text-lg font-semibold text-gray-900">{title}</p>
            ) : (
              <input
                type="text"
                placeholder="Enter your product title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-semibold border-0 focus:outline-none focus:ring-0 p-0"
              />
            )}
          </div>
          {title && (
            <button
              onClick={() => {
                const newTitle = prompt('Edit your product title:', title);
                if (newTitle) setTitle(newTitle);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={generateOutline}
        disabled={!title || loading}
        className="w-full max-w-xs bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-6 rounded-lg hover:bg-[#B8963B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        Generate My Outline
      </button>
    </div>
  );
}
