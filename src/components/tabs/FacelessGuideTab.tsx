import { useState } from 'react';

const sections = [
  { id: 'intro', title: 'Intro' },
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'path-a', title: 'Create Your AI Avatar' },
  { id: 'video', title: 'Turn Avatar Into Video' },
  { id: 'path-b', title: 'Faceless Scene Videos' },
  { id: 'save-post', title: 'Save and Post' },
  { id: 'flow', title: 'The Complete Flow' },
];

const content = {
  intro: `This guide shows you exactly how to create AI avatar videos and faceless content using one completely free tool — Google Flow. No camera. No face. No excuses.`,
  'getting-started': `Go to labs.google/flow and sign in with your Google account. You get free daily tokens that reset at midnight. Always start with Image generation first, then convert to Video.`,
  'path-a': `You will create a realistic digital person that represents you on screen. Use this prompt template — fill in the brackets:

"A photorealistic portrait of a [age] [gender] with a [personality vibe] energy. In a [setting]. Dressed in [style] clothing. Natural window lighting. Shot like an iPhone photo on a regular day. Completely authentic and real-looking. No studio lighting. No filters."

Generate 4 images. Pick the most natural looking one.`,
  video: `Upload your chosen image into Google Flow. Switch to Video mode. Use one of these movement prompts:

Natural movement: "Natural subtle body movement. Gentle blinking. Relaxed breathing. Like someone sitting at home thinking about something."

Working: "Person at a desk, typing briefly, pausing, leaning back slightly. Natural unhurried energy."

Cafe: "Person picking up a coffee cup, taking a slow sip, looking slightly to the side. Warm ambient lighting."`,
  'path-b': `No person needed. Generate mood scenes using these prompts:

Work from home: "Slow cinematic shot of a minimal home workspace in the morning. Warm natural light. Laptop open. Coffee cup. No person. Calm and aspirational."

Phone notification: "Close up of a phone screen on a wooden surface. A notification appears. Soft indoor lighting. Minimal and clean."`,
  'save-post': `Download your video from Google Flow. Open TikTok or Instagram. Upload. Add text overlay using your Content Generator output. Add caption. Post.`,
  flow: `Google Flow generates video → add text overlay in TikTok or Instagram → paste caption from Content Generator → post → repeat tomorrow.`,
};

export default function FacelessGuideTab() {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          How To Create Realistic AI Videos Without Ever Showing Your Face
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Sections</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-base transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#C9A84C] text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {sections.find((s) => s.id === activeSection)?.title}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {content[activeSection as keyof typeof content]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
