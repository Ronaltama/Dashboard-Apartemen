import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import { getFloors, getRoomsByFloor } from '../services/api';

// TabBar component with Admin tab
const TabBar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-4 left-1/2 md:left-7/12 transform -translate-x-1/2 z-30 bg-white rounded-full shadow-md border border-gray-200 flex justify-around items-center h-12 px-2 w-11/12 max-w-xs">
      {/* Energy Tab */}
      <button
        className={`flex flex-col items-center justify-center w-full h-full rounded-full transition-colors ${
          activeTab === 'energy' 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-blue-300'
        }`}
        onClick={() => setActiveTab('energy')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
        <span className="text-[10px] mt-0.5">Energy</span>
      </button>
      
      {/* Admin/Control Tab */}
      <button
        className={`flex flex-col items-center justify-center w-full h-full rounded-full transition-colors ${
          activeTab === 'admin' 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-blue-300'
        }`}
        onClick={() => setActiveTab('admin')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
        <span className="text-[10px] mt-0.5">Admin</span>
      </button>
      
      {/* Profile Tab */}
      <button
        className={`flex flex-col items-center justify-center w-full h-full rounded-full transition-colors ${
          activeTab === 'profile' 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-blue-300'
        }`}
        onClick={() => setActiveTab('profile')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
        <span className="text-[10px] mt-0.5">Profile</span>
      </button>
    </div>
  );
};

const Dashboard = () => {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('energy');
  
  // Admin states
  const [adminSections, setAdminSections] = useState([
    { id: 'hotel', name: 'Hotel Management', active: true },
    { id: 'user', name: 'User Management', active: false }
  ]);
  const [activeAdminSection, setActiveAdminSection] = useState('hotel');

  const [profileSections, setProfileSections] = useState([
    { id: 'settings', name: 'User Settings', active: true },
    { id: 'logout', name: 'User Logout', active: false }
  ]);
  const [activeProfileSection, setActiveProfileSection] = useState('settings');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const floorsData = await getFloors();
        setFloors(floorsData);
        
        if (floorsData.length > 0) {
          setSelectedFloor(floorsData[0].id_lantai);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedFloor !== null) {
        try {
          const roomsData = await getRoomsByFloor(selectedFloor);
          setRooms(roomsData);
        } catch (error) {
          console.error('Error fetching rooms:', error);
        }
      }
    };
    
    fetchRooms();
  }, [selectedFloor]);

  const handleFloorSelect = (floorId) => {
    setSelectedFloor(floorId);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAdminSectionSelect = (sectionId) => {
    setAdminSections(sections => 
      sections.map(section => ({
        ...section,
        active: section.id === sectionId
      }))
    );
    setActiveAdminSection(sectionId);
  };

  const handleProfileSectionSelect = (sectionId) => {
    setProfileSections(sections => 
      sections.map(section => ({
        ...section,
        active: section.id === sectionId
      }))
    );
    setActiveProfileSection(sectionId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar 
          floors={floors} 
          selectedFloor={selectedFloor} 
          onSelectFloor={handleFloorSelect} 
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeTab={activeTab}
          adminSections={adminSections}
          onSelectAdminSection={handleAdminSectionSelect}
          activeAdminSection={activeAdminSection}
          profileSections={profileSections}
          onSelectProfileSection={handleProfileSectionSelect}
          activeProfileSection={activeProfileSection}
        />
        
        <main className="flex-1 p-6 pb-20">
          {/* Mobile toggle button */}
          <button 
            className="md:hidden mb-4 p-2 rounded-md bg-gray-200 text-gray-700"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Energy Tab Content */}
          {activeTab === 'energy' && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {selectedFloor ? `Floor ${floors.find(f => f.id_lantai === selectedFloor)?.nomer_lantai} Rooms` : 'Select a Floor'}
              </h1>
              
              {rooms.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-600">No rooms found for this floor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map(room => (
                    <RoomCard key={room.id_kamar} room={room} />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Admin Tab Content */}
          {activeTab === 'admin' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {activeAdminSection === 'hotel' && 'Hotel Management'}
                {activeAdminSection === 'user' && 'User Management'}
              </h2>
              
              {/* Hotel Management */}
              {activeAdminSection === 'hotel' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p className="text-gray-500">User management will be available in the next update</p>
                  </div>
                </div>
              )}
              
              {/* User Management */}
              {activeAdminSection === 'user' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p className="text-gray-500">User management will be available in the next update</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {activeProfileSection === 'settings' && 'User Settings'}
                {activeProfileSection === 'logout' && 'User Logout'}
              </h2>
              
              {activeProfileSection === 'settings' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p className="text-gray-500">Settings will be available in the next update</p>
                  </div>
                </div>
              )}
              
              {activeProfileSection === 'logout' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p className="text-gray-500">Logout will be available in the next update</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};

export default Dashboard;