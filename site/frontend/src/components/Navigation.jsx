import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { path: '/', label: 'Home' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/testing-techniques', label: 'Testing Techniques' },
    { path: '/testing-pyramid', label: 'Testing Pyramid' },
    { path: '/testing-ai-agents', label: 'AI Agents' },
    { path: '/reports', label: 'Reports' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-8">
              <span className="text-white font-bold text-lg whitespace-nowrap">Max Profit</span>
              <div className="hidden lg:flex space-x-1">
                {links.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${location.pathname === link.path
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileMenu}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-slate-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <span className="text-white font-bold">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-slate-400 hover:text-white"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 py-4">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`
                    block px-4 py-3 text-base font-medium transition-colors
                    ${location.pathname === link.path
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
