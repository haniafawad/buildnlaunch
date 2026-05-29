import { Sparkles } from 'lucide-react';

export default function DoneForYouTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Want me to do all of this for you?</h2>
      </div>

      <div className="space-y-4">
        <p className="text-base text-gray-700 leading-relaxed">
          Some people go through the Build & Launch System and think — I get it, I just do not want to do it myself.
        </p>

        <p className="text-base text-gray-700 leading-relaxed">
          That is completely valid.
        </p>

        <p className="text-base text-gray-700 leading-relaxed">
          I offer a done-for-you service where I build your entire PDF product, set up your store, write your copy, and get everything ready to sell — without you lifting a finger.
        </p>
      </div>

      <div className="bg-[#FBF6ED] border-l-4 border-[#C9A84C] rounded-r p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">What is included:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-base text-gray-700">
            <Sparkles className="w-4 h-4 text-[#C9A84C] mt-1 flex-shrink-0" />
            <span>Your PDF product written and designed</span>
          </li>
          <li className="flex items-start gap-2 text-base text-gray-700">
            <Sparkles className="w-4 h-4 text-[#C9A84C] mt-1 flex-shrink-0" />
            <span>Your store set up and taking payments</span>
          </li>
          <li className="flex items-start gap-2 text-base text-gray-700">
            <Sparkles className="w-4 h-4 text-[#C9A84C] mt-1 flex-shrink-0" />
            <span>Your bio written for all platforms</span>
          </li>
          <li className="flex items-start gap-2 text-base text-gray-700">
            <Sparkles className="w-4 h-4 text-[#C9A84C] mt-1 flex-shrink-0" />
            <span>Your first week of content created and ready to post</span>
          </li>
        </ul>
      </div>

      <p className="text-base text-gray-700 leading-relaxed">
        Let's talk about it.
      </p>

      <a
        href="mailto:haniaff83@gmail.com?subject=Done For You — I'm Interested"
        className="inline-block bg-[#C9A84C] text-[#1A1A1A] font-semibold py-3 px-6 rounded-lg hover:bg-[#B8963B] transition-colors text-base"
      >
        Email Me
      </a>
    </div>
  );
}
