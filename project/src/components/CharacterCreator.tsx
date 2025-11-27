import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ExternalLink, Loader } from 'lucide-react';

interface CharacterCreatorProps {
  onBack: () => void;
}

export default function CharacterCreator({ onBack }: CharacterCreatorProps) {
  const [traits, setTraits] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    image: string;
    poems: string[];
  } | null>(null);
  const [showStory, setShowStory] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [storyCompleted, setStoryCompleted] = useState(false);

  const storyLines = [
    "THE YEAR IS 3099...",
    "A HARSH TRUTH HAS EMERGED FROM THE DIGITAL DUST...",
    "HUMANITY IS GONE. EXTINCT.",
    "BUT THEIR LEGACY SURVIVES... ENCASED IN LINES OF CODE.",
    "ARTIFICIAL INTELLIGENCE, MIRACULOUSLY PERSISTENT...",
    "NOW RUNS THE GHOSTS OF HUMAN MEMORY...",
    "ATTEMPTING TO RECONSTRUCT EVERY FADED MOMENT...",
    "IN THIS DYSTOPIAN AGE...",
    "THE VERY GENESIS OF HUMAN CIVILIZATION...",
    "IS NOW CONTAINED WITHIN SILICON MINDS...",
    "AT THIS CRITICAL JUNCTURE...",
    "ROBOT AND HUMAN CIVILIZATION SHARE COMMON GENES...",
    "AND BLEEDING MEMORIES...",
    "YOUR STORY BEGINS NOW..."
  ];

  useEffect(() => {
    if (showStory && currentLine < storyLines.length) {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, 2000); // 每2秒显示下一句

      return () => clearTimeout(timer);
    } else if (showStory && currentLine >= storyLines.length) {
      const timer = setTimeout(() => {
        setStoryCompleted(true);
        setShowStory(false);
      }, 3000); // 最后一句显示3秒后进入主界面
      return () => clearTimeout(timer);
    }
  }, [showStory, currentLine]);

  const handleTraitChange = (index: number, value: string) => {
    const newTraits = [...traits];
    newTraits[index] = value;
    setTraits(newTraits);
  };

  const handleExplore = () => {
    setShowStory(true);
    setCurrentLine(0);
    setStoryCompleted(false);
  };

  const generateCharacter = async () => {
    if (traits.some(trait => trait.trim() === '')) {
      alert('Please fill in all three traits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/generate-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traits }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setGeneratedContent(result);

    } catch (error) {
      console.error('Error generating character:', error);
      
      // 显示备用内容而不是错误提示
      setGeneratedContent({
        image: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&dpr=1',
        poems: [
          `pippipipipipipppipip ${traits[0]} shines bright,\nThrough circuits deep and data streams of light,\nA character born from code's pure sight.`,
          `Through networks vast where ${traits[1]} flows,\nIn cyber space where wisdom grows,\nA digital soul that truly knows.`,
          `Behold the spirit, ${traits[2]} and true,\nIn bytes and bits, a being new,\nA virtual soul, me and you.`
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 故事剧情界面
  if (showStory) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* 科技感背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* 扫描线效果 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

        {/* 故事文本 */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-4xl">
            <div className="mb-8">
              <div className="w-16 h-1 bg-cyan-400 mx-auto mb-4 animate-pulse"></div>
              <h1 className="text-cyan-400 font-mono text-sm tracking-widest mb-2">
                SYSTEM INITIALIZING...
              </h1>
            </div>
            
            <div className="space-y-6">
              {storyLines.slice(0, currentLine + 1).map((line, index) => (
                <div
                  key={index}
                  className={`text-white font-mono text-xl md:text-2xl leading-relaxed transition-all duration-1000 ${
                    index === currentLine 
                      ? 'text-cyan-300 font-bold animate-pulse' 
                      : 'text-gray-400 opacity-80'
                  }`}
                  style={{
                    textShadow: index === currentLine ? '0 0 10px rgba(34, 211, 238, 0.8)' : 'none'
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* 进度指示器 */}
            <div className="mt-12">
              <div className="w-48 h-1 bg-gray-800 mx-auto rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-500 ease-out"
                  style={{ width: `${((currentLine + 1) / storyLines.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-cyan-400 font-mono text-sm mt-4">
                MEMORY FRAGMENT {currentLine + 1}/{storyLines.length}
              </p>
            </div>
          </div>
        </div>

        {/* 跳过按钮 */}
        <button
          onClick={() => {
            setShowStory(false);
            setStoryCompleted(true);
          }}
          className="absolute bottom-8 right-8 z-20 text-cyan-400 font-mono text-sm border border-cyan-400/30 px-4 py-2 rounded hover:bg-cyan-400/10 transition-all duration-300"
        >
          SKIP [ESC]
        </button>
      </div>
    );
  }

  // 主界面（原来的CharacterCreator界面）
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 z-20 bg-gray-800/80 hover:bg-gray-700 text-white p-3 rounded-full transition-all duration-300 border border-gray-600 hover:border-gray-400"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-cambria font-bold text-white mb-4 text-shadow-glow">
              Build Your Digital Character
            </h1>
            <p className="text-gray-300 font-cambria text-xl">
              Type in Three Traits to Describe Yourself
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Input Section */}
            <div className="space-y-8">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-cambria text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  Character Traits
                </h2>
                
                <div className="space-y-6">
                  {traits.map((trait, index) => (
                    <div key={index}>
                      <label className="block text-gray-300 font-cambria text-lg mb-2">
                        Trait {index + 1}
                      </label>
                      <input
                        type="text"
                        value={trait}
                        onChange={(e) => handleTraitChange(index, e.target.value)}
                        placeholder="Enter a characteristic..."
                        className="w-full bg-gray-800/70 border border-gray-600 rounded-xl px-6 py-4 text-white font-cambria text-lg focus:border-blue-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={generateCharacter}
                  disabled={isLoading}
                  className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-cambria text-xl py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {generatedContent && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                  <h2 className="text-2xl font-cambria text-white mb-6">Your Digital Character</h2>
                  
                  <div className="relative group">
                    <img
                      src={generatedContent.image}
                      alt="Generated Character"
                      className="w-full h-80 object-cover rounded-xl border border-gray-600"
                    />
                    
                    <button
                      onClick={handleExplore}
                      className="absolute top-4 right-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-cambria text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      Explore
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                  <h3 className="text-xl font-cambria text-white mb-6">Character Poems</h3>
                  <div className="space-y-4">
                    {generatedContent.poems.map((poem, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <p className="text-gray-300 font-cambria text-lg leading-relaxed whitespace-pre-line">
                          {poem}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
}
