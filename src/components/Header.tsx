import { useState } from "react";
import { Menu, Bell, User, Plus, Target, TrendingUp, Users, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onAddJob: () => void;
}

export const Header = ({ onAddJob }: HeaderProps) => {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const hamburgerMenuItems = [
    { icon: Plus, label: "Add Job", action: onAddJob },
    { icon: TrendingUp, label: "Analytics", action: () => navigate("/analytics") },
    { icon: Users, label: "Network", action: () => console.log("Network clicked") },
    { icon: Mail, label: "Email Settings", action: () => navigate("/email-settings") },
    { icon: Clock, label: "View Timeline", action: () => console.log("Timeline clicked") },
  ];

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Hamburger and Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                  className="hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </Button>
                
                {/* Hamburger Menu */}
                {showHamburgerMenu && (
                  <div className="absolute left-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 z-50 py-2">
                    {hamburgerMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setShowHamburgerMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <img
                  src="/favicon.ico"
                  alt="JobTrail Logo"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-xl font-bold text-gray-800">JobTrail</span>
              </div>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                </Button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg min-w-72 z-50 p-4">
                    <h3 className="font-medium text-gray-800 mb-2">Notifications</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>No new notifications</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="hover:bg-gray-100 rounded-full profile-avatar"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
                
                {showProfileMenu && (
                  <div className="profile-menu">
                    <div className="profile-preamble">
                      <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                    </div>
                    
                    <ul>
                      <li onClick={() => setShowProfileMenu(false)}>Profile Settings</li>
                      <li onClick={() => setShowProfileMenu(false)}>Preferences</li>
                      <li onClick={() => setShowProfileMenu(false)}>Help & Support</li>
                    </ul>
                    
                    <div className="profile-submenu">
                      <div className="profile-signout" onClick={handleSignOut}>
                        Sign Out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Click outside to close menus */}
        {(showHamburgerMenu || showProfileMenu || showNotifications) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowHamburgerMenu(false);
              setShowProfileMenu(false);
              setShowNotifications(false);
            }}
          />
        )}
      </header>

      <style>{`
        .profile-dropdown {
          position: relative;
          display: inline-block;
        }
        .profile-avatar {
          box-shadow: 0 2px 8px rgba(44,62,80,0.13);
        }
        .profile-menu {
          position: absolute;
          right: 0;
          top: 44px;
          background: #fff;
          color: #222;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          min-width: 180px;
          z-index: 4000;
          padding: 10px 0;
          animation: fadeIn 0.2s;
        }
        .profile-menu ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .profile-menu li {
          padding: 8px 18px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .profile-menu li:hover {
          background: #f4f4f4;
        }
        .profile-preamble {
          padding: 10px 18px 6px 18px;
          border-bottom: 1px solid #eee;
          margin-bottom: 4px;
          font-size: 13px;
          color: #444;
        }
        .profile-signout {
          padding: 10px 18px 0 18px;
          color: #e74c3c;
          cursor: pointer;
          font-size: 14px;
        }
        .profile-signout:hover {
          background: #f4f4f4;
        }
        .profile-submenu {
          border-top: 1px solid #eee;
          margin-top: 4px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </>
  );
};