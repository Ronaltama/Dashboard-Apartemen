import React from 'react';

const Sidebar = ({ 
  floors, 
  selectedFloor, 
  onSelectFloor, 
  isOpen, 
  toggleSidebar,
  activeTab,
  adminSections,
  onSelectAdminSection,
  activeAdminSection,
  profileSections,
  onSelectProfileSection,
  activeProfileSection,
}) => {
  return (
    <div 
      className={`fixed md:relative z-50 w-64 bg-gray-800 text-white min-h-screen transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">iBright Dashboard</h2>
          <p className="text-gray-400 text-sm">
            {activeTab === 'energy' && 'Energy Monitoring'}
            {activeTab === 'admin' && 'Admin Control Panel'}
            {activeTab === 'profile' && 'Profile'}
          </p>
        </div>
        <button 
          className="md:hidden text-gray-400 hover:text-white"
          onClick={toggleSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Energy Tab Content */}
      {activeTab === 'energy' && (
        <div className="p-4">
          <h3 className="text-md font-semibold mb-2">Floors</h3>
          <ul>
            {floors.map(floor => (
              <li key={floor.id_lantai}>
                <button
                  className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                    selectedFloor === floor.id_lantai 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => onSelectFloor(floor.id_lantai)}
                >
                  Floor {floor.nomer_lantai}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Admin Tab Content */}
      {activeTab === 'admin' && (
        <div className="p-4">
          <h3 className="text-md font-semibold mb-2">Admin Sections</h3>
          <ul>
            {adminSections.map(section => (
              <li key={section.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                    section.active
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => onSelectAdminSection(section.id)}
                >
                  {section.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-4">
          <h3 className="text-md font-semibold mb-2">Profile Sections</h3>
          <ul>
            {profileSections.map(section => (
              <li key={section.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                    section.active
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => onSelectProfileSection(section.id)}
                >
                  {section.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="p-4 mt-6 border-t border-gray-700">
        <p className="text-gray-400 text-sm">Current date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Sidebar;