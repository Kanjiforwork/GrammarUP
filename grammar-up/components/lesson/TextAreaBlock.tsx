'use client'

interface Example {
  en: string
  vi: string
}

interface TextAreaBlockProps {
  heading: string
  content: string
  examples?: Example[]
  notes?: string[]
}

export function TextAreaBlock({ heading, content, examples, notes }: TextAreaBlockProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-1 h-8 bg-teal-500 rounded-full" />
        {heading}
      </h2>
      
      {/* Content */}
      <div className="space-y-6">
        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
          {content}
        </p>
        
        {/* Notes */}
        {notes && notes.length > 0 && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-teal-900 mb-2">Lưu ý:</h3>
                <ul className="space-y-2">
                  {notes.map((note, index) => (
                    <li key={index} className="text-sm text-teal-800 leading-relaxed">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Examples */}
        {examples && examples.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Ví dụ:
            </h3>
            {examples.map((example, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-5 hover:border-teal-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-gray-900 font-medium text-lg">
                      {example.en}
                    </p>
                    <p className="text-gray-600">
                      {example.vi}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
