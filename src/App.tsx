// src/App.tsx - Hauptkomponente Feedbackstudio Deutsch Heimbürgeschule Kahla
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { LoginModal } from './components/auth/LoginModal';
import { StudentWorkspace } from './components/student/StudentWorkspace';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { PromptManagerModal } from './components/teacher/PromptManagerModal';
import { ClassSettingsModal } from './components/teacher/ClassSettingsModal';

const AppContent: React.FC = () => {
  const { role, isLoading } = useAuth();

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isClassSettingsOpen, setIsClassSettingsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <img src="/siegel_bunt.png" alt="Heimbürgeschule" className="w-16 h-16 mx-auto animate-bounce" />
          <p className="text-sm font-bold text-school-blue">Lade Feedbackstudio Deutsch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-slate-800 flex flex-col selection:bg-school-orangeLight selection:text-school-orangeDark">
      {/* Header mit Schulsiegel und Status */}
      <Header
        onOpenPromptManager={() => setIsPromptModalOpen(true)}
        onOpenClassSettings={() => setIsClassSettingsOpen(true)}
      />

      {/* Hauptbereich: Fluid-adaptiv nach responsive-school-apps (Mobile bis 4K iMac) */}
      <main className="flex-1 w-full max-w-[2100px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 pb-safe">
        {role === null && <LoginModal />}

        {role === 'student' && <StudentWorkspace />}

        {role === 'teacher' && <TeacherDashboard />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-school-border bg-white/70 py-4 px-4 text-center text-xs text-slate-500 no-print pb-safe">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Staatliche Regelschule Heimbürgeschule Kahla • Deutsch Abschlussprüfungstraining</span>
          <span className="font-mono text-[11px] text-slate-400">Version 1.0 (Stark-Modell Thüringen)</span>
        </div>
      </footer>

      {/* Modals für Lehrkräfte */}
      {isPromptModalOpen && (
        <PromptManagerModal onClose={() => setIsPromptModalOpen(false)} />
      )}

      {isClassSettingsOpen && (
        <ClassSettingsModal
          onClose={() => setIsClassSettingsOpen(false)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
