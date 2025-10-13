'use client'

interface IntroBlockProps {
  title: string
  subtitle: string
  kahootHint?: string
  cta?: string
  onStart?: () => void
}

export function IntroBlock({ 
  title, 
  subtitle, 
  kahootHint, 
  cta = 'Bắt đầu học',
  onStart 
}: IntroBlockProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden p-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-12 text-white shadow-2xl max-w-4xl w-full">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-3xl">
          {/* Kahoot hint */}
          {kahootHint && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-sm font-medium">{kahootHint}</span>
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-teal-50 mb-8 font-light">
            {subtitle}
          </p>
          
          {/* CTA Button */}
          <button
            onClick={onStart}
            className="px-8 py-4 bg-white text-teal-600 rounded-2xl font-semibold text-lg hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-3"
          >
            <span>{cta}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
