import { useState, useEffect } from 'react';
import { User, Progress, SavedContent } from '../../types';
import { supabase } from '../../lib/supabase';
import { Copy, Trash2, Check } from 'lucide-react';

interface ContentGeneratorTabProps {
  user: User;
  progress: Progress | null;
  onProgressUpdate: () => void;
}

const CONTENT_TYPES = [
  'PAIN',
  'MYTH BUSTING',
  'STORY',
  'CURIOSITY',
  'ENGAGEMENT',
  'VALUE',
  'SELL',
];

const FORMAT_TYPES = [
  'POV',
  'Countdown',
  'If you see this',
  'Myth bust',
  'Story',
  'Result reveal',
  'Soft sell',
];

export default function ContentGeneratorTab({ user, progress, onProgressUpdate }: ContentGeneratorTabProps) {
  const [angle, setAngle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<{
    contentType: string;
    format: string;
    textOverlay: string;
    caption: string;
    hashtags: string;
  } | null>(null);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSavedContent();
  }, [user.id]);

  const fetchSavedContent = async () => {
    const { data } = await supabase
      .from('saved_content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setSavedContent(data as SavedContent[]);
  };

  const getNextContentType = () => {
    const index = progress?.content_type_index || 0;
    const nextIndex = (index + 1) % CONTENT_TYPES.length;
    return { current: CONTENT_TYPES[index], nextIndex };
  };

  const getNextFormat = () => {
    const index = progress?.format_type_index || 0;
    const nextIndex = (index + 1) % FORMAT_TYPES.length;
    return { current: FORMAT_TYPES[index], nextIndex };
  };

  const generateContent = async () => {
    setLoading(true);
    setError('');

    const { current: contentType } = getNextContentType();
    const { current: format } = getNextFormat();

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          productTitle: user.product_title,
          audience: user.audience,
          topic: user.topic,
          contentType,
          format,
          angle: angle || 'none',
        },
      });

      if (error) throw error;

      setGenerated(data);

      // Update progress with next index
      const typeIndex = (progress?.content_type_index || 0) + 1;
      const formIndex = (progress?.format_type_index || 0) + 1;

      await supabase
        .from('progress')
        .update({
          content_type_index: typeIndex % CONTENT_TYPES.length,
          format_type_index: formIndex % FORMAT_TYPES.length,
        })
        .eq('user_id', user.id);

      if (!progress?.first_content_posted) {
        await supabase
          .from('progress')
          .update({ first_content_posted: true })
          .eq('user_id', user.id);
        onProgressUpdate();
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Something went wrong — tap to try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async () => {
    if (!generated || saving) return;
    setSaving(true);

    try {
      await supabase.from('saved_content').insert({
        user_id: user.id,
        content_type: generated.contentType,
        format: generated.format,
        text_overlay: generated.textOverlay,
        caption: generated.caption,
        hashtags: generated.hashtags,
      });

      fetchSavedContent();
      setGenerated(null);
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('saved_content').delete().eq('id', id);
    fetchSavedContent();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Generator</h2>
        <p className="text-gray-600">Ready-to-post content for your product.</p>
      </div>

      {user.product_title && (
        <div className="border-2 border-[#C9A84C] rounded-lg p-4 bg-[#FBF6ED]">
          <p className="text-sm text-gray-600">Product</p>
          <p className="text-base font-semibold text-gray-900">{user.product_title}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any specific angle today? (optional)
        </label>
        <input
          type="text"
          placeholder="Leave blank for automatic"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-base"
        />
      </div>

      <button
        onClick={generateContent}
        disabled={loading || !user.product_title}
        className="w-full max-w-xs bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-6 rounded-lg hover:bg-[#B8963B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {loading ? 'Generating...' : 'Generate My Content'}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {generated && (
        <div className="space-y-4 mt-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-[#C9A84C] font-semibold uppercase">Content Type: {generated.contentType}</p>
                <p className="text-xs text-gray-500">Format: {generated.format}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-900">Text Overlay</p>
                  <button
                    onClick={() => handleCopy(generated.textOverlay, 'overlay')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copied === 'overlay' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{generated.textOverlay}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-900">Caption</p>
                  <button
                    onClick={() => handleCopy(generated.caption, 'caption')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copied === 'caption' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{generated.caption}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-900">Hashtags</p>
                  <button
                    onClick={() => handleCopy(generated.hashtags, 'hashtags')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copied === 'hashtags' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-700">{generated.hashtags}</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 border border-[#C9A84C] text-[#C9A84C] font-semibold py-2 px-4 rounded-lg hover:bg-[#FBF6ED] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save This Content'}
            </button>
          </div>
        </div>
      )}

      {savedContent.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Content</h3>
          <div className="space-y-3">
            {savedContent.map((content) => (
              <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-[#C9A84C] font-semibold uppercase">{content.content_type}</p>
                    <p className="text-xs text-gray-500">{content.format}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(content.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{content.text_overlay}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
