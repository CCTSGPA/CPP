import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ChevronDown, ShieldCheck } from 'lucide-react';
import Avatar from './Avatar';
import { isAuthenticated, getUserFromToken, clearAuthToken } from '../services/authService';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-2 py-1 rounded text-sm font-medium ${
          isActive
            ? "text-gov border-b-2 border-gov"
            : "text-neutral-700 hover:text-gov"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const deptRef = useRef(null);
  const deptToggleRef = useRef(null);

  const getUserLabel = () => {
    if (user?.name?.trim()) {
      return user.name.trim().split(" ")[0];
    }

    if (user?.email?.includes("@")) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setProfileOpen(false);
    setOpen(false);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  useEffect(() => {
    function handleDoc(e) {
      if (!deptRef.current || !deptToggleRef.current) return;
      if (
        deptRef.current.contains(e.target) ||
        deptToggleRef.current.contains(e.target)
      )
        return;
      setDeptOpen(false);
      setProfileOpen(false);
    }

    function handleKey(e) {
      if (e.key === "Escape") {
        setDeptOpen(false);
        setProfileOpen(false);
      }
    }

    function handleAuthChanged() {
      setUser(getUserFromToken());
    }

    // initialize and listen for auth changes
    handleAuthChanged();
    document.addEventListener("click", handleDoc);
    document.addEventListener("keydown", handleKey);
    window.addEventListener('authChanged', handleAuthChanged);
    return () => {
      document.removeEventListener("click", handleDoc);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener('authChanged', handleAuthChanged);
    };
  }, []);

  return (
    <nav className="group bg-gradient-to-r from-[#F4EBFF] to-[#E8FDFF] shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top row */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/home" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-[#6A0DAD] to-[#00CED1] text-white flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div className="text-lg font-semibold">
                <div className="text-base font-bold text-neutral-900">CivicWatch</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <NavItem to="/home">Home</NavItem>
              <NavItem to="/file-complaint">File Complaint</NavItem>
              <NavItem to="/complaint-history">Complaint History</NavItem>
              <NavItem to="/upload-evidence">Upload Evidence</NavItem>
              <NavItem to="/download-forms">Download Forms</NavItem>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white/60 rounded-full px-3 py-1 gap-2 text-sm">
              <Search size={16} />
              <input
                placeholder="Search complaints"
                className="bg-transparent outline-none text-sm"
              />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              {/* Show avatar when logged in, otherwise show Login / Sign Up */}
              {isAuthenticated() ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen((s) => !s)}
                      className="p-0"
                      aria-label="Profile"
                    >
                      <Avatar name={getUserLabel()} size={36} />
                    </button>

                    <div className={`absolute right-0 mt-2 bg-white shadow-soft rounded-lg p-2 w-44 ${profileOpen ? 'block' : 'hidden'}`}>
                      <div className="text-sm text-neutral-700 py-1">Signed in as</div>
                      <div className="font-medium">{getUserLabel()}</div>
                      <hr className="my-2" />
                      <Link to="/guidelines#steps" onClick={() => { setProfileOpen(false); navigate('/guidelines#steps'); }} className="block py-1 text-sm text-neutral-700 hover:text-gov">How to use</Link>
                      <button onClick={handleLogout} className="w-full text-left py-1 text-sm text-neutral-700 hover:text-gov">Sign out</button>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-neutral-700 max-w-24 truncate" title={getUserLabel()}>
                    {getUserLabel()}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1 rounded bg-gov text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-neutral-700 hover:text-gov"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm px-6 py-1 rounded bg-gov text-white text-center w-28"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Desktop secondary menu (hover to reveal) */}
        <div className="hidden md:block max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-h-32 group-hover:opacity-100">
          <div className="border-t mt-2" />
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-4 text-neutral-600">
            {/* Departments dropdown: supports click-to-open (persists) and hover-to-open on desktop */}
            <div className="relative group" ref={deptToggleRef}>
              <button
                ref={deptToggleRef}
                onClick={(e) => {
                  e.preventDefault();
                  setDeptOpen((s) => !s);
                }}
                aria-haspopup="true"
                aria-expanded={deptOpen}
                className="flex items-center gap-1 hover:text-[#6A0DAD]"
              >
                Departments <ChevronDown size={14} />
              </button>

              <div
                ref={deptRef}
                className={`absolute left-0 mt-2 bg-white shadow-soft rounded-lg p-3 w-56 ${
                  deptOpen ? "block" : "hidden"
                } group-hover:block`}
              >
                <Link
                  to="/departments#finance"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Finance
                </Link>
                <Link
                  to="/departments#licensing"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Licensing
                </Link>
                <Link
                  to="/departments#procurement"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Procurement
                </Link>
                <Link
                  to="/departments#hr"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Human Resources
                </Link>
                <Link
                  to="/departments#public-works"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Public Works
                </Link>
                <Link
                  to="/departments#transport"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Transport
                </Link>
                <Link
                  to="/departments#health"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Health
                </Link>
                <Link
                  to="/departments#education"
                  onClick={() => setDeptOpen(false)}
                  className="block py-1 text-sm text-neutral-700 hover:text-[#6A0DAD]"
                >
                  Education
                </Link>
              </div>
            </div>

            <Link to="/guidelines#steps" className="hover:text-[#6A0DAD]">
              How to file
            </Link>
            <Link to="/faqs" className="hover:text-[#6A0DAD]">
              FAQs
            </Link>
            <Link to="/help" className="hover:text-[#6A0DAD]">
              Help & Support
            </Link>
            <Link to="/about" className="hover:text-[#6A0DAD]">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-[#6A0DAD]">
              Contact Us
            </Link>
            <Link to="/transparency-report" className="hover:text-[#6A0DAD]">
              Transparency Report
            </Link>
            <Link to="/geo-heatmap" className="hover:text-[#6A0DAD]">
              Heatmap
            </Link>
            </div>
          </div>
        </div>

        {/* Mobile secondary links */}
        <div className={`md:hidden ${open ? "block" : "hidden"} py-2`}>
            <div className="flex flex-col gap-2">
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive ? "text-gov" : "text-neutral-700"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/file-complaint"
                className={({ isActive }) =>
                  isActive ? "text-gov" : "text-neutral-700"
                }
              >
                File Complaint
              </NavLink>
              <NavLink
                to="/complaint-history"
                className={({ isActive }) =>
                  isActive ? "text-gov" : "text-neutral-700"
                }
              >
                Complaint History
              </NavLink>
              <NavLink
                to="/upload-evidence"
                className={({ isActive }) =>
                  isActive ? "text-gov" : "text-neutral-700"
                }
              >
                Upload Evidence
              </NavLink>
              <NavLink
                to="/download-forms"
                className={({ isActive }) =>
                  isActive ? "text-gov" : "text-neutral-700"
                }
              >
                Download Forms
              </NavLink>
              <hr />
              <Link to="/guidelines#steps" className="text-neutral-700">
                How to file
              </Link>
              <Link to="/departments" className="text-neutral-700">
                Departments
              </Link>
              <Link to="/faqs" className="text-neutral-700">
                FAQs
              </Link>
              <Link to="/help" className="text-neutral-700">
                Help & Support
              </Link>
              <Link to="/about" className="text-neutral-700">
                About Us
              </Link>
              <Link to="/contact" className="text-neutral-700">
                Contact Us
              </Link>
              <Link to="/transparency-report" className="text-neutral-700">
                Transparency Report
              </Link>
              <Link to="/geo-heatmap" className="text-neutral-700">
                Heatmap
              </Link>
              <div className="pt-2">
                {isAuthenticated() ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={getUserLabel()} size={36} />
                      <div className="flex-1">
                        <div className="font-medium">{getUserLabel()}</div>
                        <div className="text-sm text-neutral-600">Signed in</div>
                      </div>
                    </div>
                    <Link to="/guidelines#steps" onClick={() => setOpen(false)} className="block py-2 text-sm text-neutral-700 hover:text-gov">How to use</Link>
                    <button onClick={handleLogout} className="block text-sm text-sky-700 text-left">Sign out</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="text-neutral-700">Login</Link>
                    <Link to="/signup" className="px-3 py-1 rounded bg-gov text-white">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </nav>
  );
}
