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
          <img src={userInfo.image} style={{border:'solid'}} alt="Profile" className="profile-image" />
         
          <p style={{fontSize:'large'}}> <span id="info">Name:</span> {userInfo.first_name} {userInfo.last_name}</p>
          <p><span id="info">Gmail:</span> {userInfo.email}</p>
          <p><span id="info">Age:</span> 30</p>
          <p><span id="info">Sex:</span>  Male</p>
          <p><span id="info">Business:</span> :Yes</p>
          <div className="notifications">
            <p><span id="info">Notifications:</span>:</p>
            <label className="toggle">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <button className='btn btn-danger'>Block User</button>
          
        </div>
      </div>
    </div>
  );
}

export default Sidebar;