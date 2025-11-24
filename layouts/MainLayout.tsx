import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen w-full flex items-center justify-center p-4 pt-24 pb-16 md:p-8 md:pt-32 md:pb-16 bg-gray-900 bg-grid-white/[0.05] relative overflow-y-auto">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gray-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="z-10 w-full h-full">
            {children}
        </div>
        <style>{`
            .bg-grid-white\\[\\[0\\.05\\]] {
              background-image: linear-gradient(white 0.5px, transparent 0.5px), linear-gradient(to right, white 0.5px, transparent 0.5px);
              background-size: 20px 20px;
              background-position: -1px -1px;
            }
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
