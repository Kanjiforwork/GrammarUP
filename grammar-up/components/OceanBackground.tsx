export function OceanBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-cyan-100"></div>
      
      {/* Sun */}
      <div className="absolute top-20 right-32 w-32 h-32 bg-yellow-300 rounded-full shadow-lg animate-pulse-slow">
        <div className="absolute inset-2 bg-yellow-200 rounded-full"></div>
      </div>
      
      {/* Clouds */}
      <div className="absolute top-16 left-32 animate-float-slow">
        <div className="relative w-40 h-16">
          <div className="absolute top-4 left-0 w-16 h-16 bg-white rounded-full opacity-90"></div>
          <div className="absolute top-0 left-12 w-24 h-24 bg-white rounded-full opacity-90"></div>
          <div className="absolute top-6 left-28 w-16 h-16 bg-white rounded-full opacity-90"></div>
        </div>
      </div>
      
      <div className="absolute top-28 right-64 animate-float-slower">
        <div className="relative w-32 h-14">
          <div className="absolute top-3 left-0 w-14 h-14 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-0 left-10 w-20 h-20 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-5 left-22 w-12 h-12 bg-white rounded-full opacity-80"></div>
        </div>
      </div>

      <div className="absolute top-40 left-1/4 animate-float">
        <div className="relative w-28 h-12">
          <div className="absolute top-2 left-0 w-12 h-12 bg-white rounded-full opacity-85"></div>
          <div className="absolute top-0 left-8 w-16 h-16 bg-white rounded-full opacity-85"></div>
          <div className="absolute top-4 left-18 w-10 h-10 bg-white rounded-full opacity-85"></div>
        </div>
      </div>
      
      {/* Ocean waves - REALISTIC OCEAN BLUE PALETTE */}
      <div className="absolute bottom-0 left-0 right-0 w-screen">
        {/* Wave 1 - Deep ocean (navy blue) */}
        <div className="absolute bottom-0 w-full h-[350px] overflow-hidden">
          <svg className="absolute bottom-0 w-[200%] h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2880 320" preserveAspectRatio="none">
            <path fill="#5783c9" fillOpacity="0.9" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,149.3C1248,160,1344,160,1440,160C1536,160,1632,160,1728,149.3C1824,139,1920,117,2016,128C2112,139,2208,181,2304,176C2400,171,2496,117,2592,106.7C2688,96,2784,128,2832,144L2880,160L2880,320L2832,320C2784,320,2688,320,2592,320C2496,320,2400,320,2304,320C2208,320,2112,320,2016,320C1920,320,1824,320,1728,320C1632,320,1536,320,1440,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave"></path>
          </svg>
        </div>
        
        {/* Wave 2 - Medium ocean (royal blue) */}
        <div className="absolute bottom-0 w-full h-[320px] overflow-hidden">
          <svg className="absolute bottom-0 w-[200%] h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2880 320" preserveAspectRatio="none">
            <path fill="#2563eb" fillOpacity="0.85" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,106.7C960,117,1056,139,1152,138.7C1248,139,1344,117,1440,106.7C1536,96,1632,96,1728,106.7C1824,117,1920,139,2016,138.7C2112,139,2208,117,2304,106.7C2400,96,2496,96,2592,112C2688,128,2784,160,2832,176L2880,192L2880,320L2832,320C2784,320,2688,320,2592,320C2496,320,2400,320,2304,320C2208,320,2112,320,2016,320C1920,320,1824,320,1728,320C1632,320,1536,320,1440,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave-slow"></path>
          </svg>
        </div>
        
        {/* Wave 3 - Light ocean (sky blue) */}
        <div className="absolute bottom-0 w-full h-[280px] overflow-hidden">
          <svg className="absolute bottom-0 w-[200%] h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2880 320" preserveAspectRatio="none">
            <path fill="
#0999e0
" fillOpacity="0.75" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,149.3C960,139,1056,149,1152,170.7C1248,192,1344,224,1440,240C1536,256,1632,256,1728,240C1824,224,1920,192,2016,170.7C2112,149,2208,139,2304,149.3C2400,160,2496,192,2592,197.3C2688,203,2784,181,2832,170.7L2880,160L2880,320L2832,320C2784,320,2688,320,2592,320C2496,320,2400,320,2304,320C2208,320,2112,320,2016,320C1920,320,1824,320,1728,320C1632,320,1536,320,1440,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave-slower"></path>
          </svg>
        </div>

        {/* Wave 4 - Foam (light blue white) */}
        <div className="absolute bottom-0 w-full h-[240px] overflow-hidden">
          <svg className="absolute bottom-0 w-[200%] h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2880 320" preserveAspectRatio="none">
            <path fill="#75aaff" fillOpacity="0.7" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,133.3C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1440,112C1536,96,1632,96,1728,112C1824,128,1920,160,2016,181.3C2112,203,2208,213,2304,197.3C2400,181,2496,139,2592,133.3C2688,128,2784,160,2832,176L2880,192L2880,320L2832,320C2784,320,2688,320,2592,320C2496,320,2400,320,2304,320C2208,320,2112,320,2016,320C1920,320,1824,320,1728,320C1632,320,1536,320,1440,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave"></path>
          </svg>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        @keyframes wave-slow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        @keyframes wave-slower {
          0% { transform: translateX(0); }
          50% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -15px); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -8px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        
        .animate-wave {
          animation: wave 8s ease-in-out infinite;
        }
        
        .animate-wave-slow {
          animation: wave-slow 10s ease-in-out infinite;
        }
        
        .animate-wave-slower {
          animation: wave-slower 12s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 18s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 20s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}