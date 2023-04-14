import React, { useState } from 'react';
import './Sidebar.css'
function Sidebar({userInfo}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  return (
    <div>
      
      <div className={`sidebar open`}>
        <div className="profile">
          <img src={userInfo.image} alt="Profile" className="profile-image" />
          <h3>{userInfo.first_name} {userInfo.last_name}</h3>
          <p>Age: 30</p>
          <p>Sex: Male</p>
          <p>Business:Yes</p>
          <div className="notifications">
            <p>Notifications:</p>
            <label className="toggle">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <button className='btn btn-danger'>Block User</button>
          <p>Gmail: {userInfo.email}</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;