import React, { useEffect, useState } from "react";
import "./sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import CookieUtil from "../../util/cookieUtil";
import AppPaths from "../../lib/appPaths";
import ApiConnector from "../../api/apiConnector";
import ApiEndpoints from "../../api/apiEndpoints";
import CommonUtil from "../../util/commonUtil";
import Constants from "../../lib/constants";
import Modal from "../modal/modal";
import axios from 'axios';
import { ReactCalculator } from "simple-react-calculator";
const Sidebar = (props) => {
  const navigate = useNavigate();
  const [chatUsers, setChatUsers] = useState([]); //sidebar users
  const [users, setUsers] = useState([]); //popup users
  const [isShowAddPeopleModal, setIsShowAddPeopleModal] = useState(false);
  const [position, setPosition] = useState({ x: 5, y: 37 });
  const [toolbar, setToolBar] = useState(true);
  const [currentUser,setCurrentUser]=useState({})
  const getUserDetailsforSelf = async () => {

    console.warn(CommonUtil.getUserId());
    try {

      
        const response = await axios.post(
            "http://127.0.0.1:8000/api/v1/getUserProfile",
            {

                'user_id': `${CommonUtil.getUserId()}`

            }
        );

        console.log(response)
        setCurrentUser(response?.data?.User)
    } catch (error) {
        console.error(error);
    }
};
useEffect(()=>{
   getUserDetailsforSelf();
},[])
  const redirectUserToDefaultChatRoom = (chatUsers) => {
    console.log(1);
    if (window.location.pathname === AppPaths.HOME) {

      props.setCurrentChattingMember(chatUsers[0]);
      navigate("/c/" + chatUsers[0].roomId);
    } else {

      const activeChatId = window.location.pathname.slice(3,);
      console.log(activeChatId)
      const chatUser = chatUsers.find((user) => user.roomId === activeChatId);

      props.setCurrentChattingMember(chatUser);
    }
  };
  const handleMouseDown = (event) => {
    const startX = event.pageX - position.x;
    const startY = event.pageY - position.y;

    const handleMouseMove = (event) => {
      setPosition({
        x: event.pageX - startX,
        y: event.pageY - startY,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', handleMouseMove);
    });
  };

  const fetchChatUser = async () => {
    const url = ApiEndpoints.USER_CHAT_URL.replace(
      Constants.USER_ID_PLACE_HOLDER,
      CommonUtil.getUserId()
    );
    const chatUsers = await ApiConnector.sendGetRequest(url);
    console.log(chatUsers)
    const formatedChatUser = CommonUtil.getFormatedChatUser(
      chatUsers,
      props.onlineUserList
    );
    setChatUsers(formatedChatUser);
    redirectUserToDefaultChatRoom(formatedChatUser);
  };

  useEffect(() => {
    fetchChatUser();
  }, []);

  const getConnectedUserIds = () => {
    let connectedUsers = "";
    for (let chatUser of chatUsers) {
      connectedUsers += chatUser.id + ",";
    }
    return connectedUsers.slice(0, -1);
  };

  const fetchUsers = async () => {
    const url = ApiEndpoints.USER_URL + "?exclude=" + getConnectedUserIds();
    const users = await ApiConnector.sendGetRequest(url);
    setUsers(users);
  };

  const addPeopleClickHandler = async () => {
    await fetchUsers();
    setIsShowAddPeopleModal(true);
  };

  const addMemberClickHandler = async (memberId) => {
    const userId = CommonUtil.getUserId();
    let requestBody = {
      members: [memberId, userId],
      type: "DM",
    };
    await ApiConnector.sendPostRequest(
      ApiEndpoints.CHAT_URL,
      JSON.stringify(requestBody),
      true,
      false
    );
    fetchChatUser();
    setIsShowAddPeopleModal(false);
  };

  const getActiveChatClass = (roomId) => {
    let activeChatId = window.location.pathname.slice(3,)
    return roomId === activeChatId ? "active-chat" : "";
  };

  const logoutClickHandler = () => {
    CookieUtil.deleteCookie(Constants.ACCESS_PROPERTY);
    CookieUtil.deleteCookie(Constants.REFRESH_PROPERTY);
    window.location.href = AppPaths.LOGIN;
  };

  const getChatListWithOnlineUser = () => {
    let updatedChatList = chatUsers?.map((user) => {
      if (props.onlineUserList.includes(user.id)) {
        user.isOnline = true;
      } else {
        user.isOnline = false;
      }
      return user;
    });
    return updatedChatList;
  };

  return (
    <div style={{ borderRight: 'solid', borderWidth: '1px', borderColor: '#9F76EB' }} className="col-12 col-sm-4 col-md-4 col-lg-4 col-xl-2">

      <div onMouseDown={handleMouseDown} style={{ boxShadow: '0 0 10px rgba(159, 119, 235, 0.5)', minHeight: 'fit-content', minWidth: 'fit-content', position: 'absolute', left: position.x, top: position.y, zIndex: '100000', padding: '10px', backgroundColor: '#18191B', borderColor: 'white', height: !toolbar ? '200px' : '81px', width: '90px', position: 'absolute' }}>
        {toolbar ?
          <div style={{ transition: "height 0.3s ease-in-out" }} className="btn mx-2 my-2" onClick={() => {
            setToolBar(false)
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-chevron-expand" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708zm0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708z" />
            </svg>
          </div>
          :

          <div>

            <div style={{ transition: "height 0.3s ease-in-out" }}>
              <button
                onClick={addPeopleClickHandler}
                className="btn"
                id="add_people"

              >
                Add People
              </button>
            </div>

            <div style={{ transition: "height 0.3s ease-in-out" }}>
              <button
                onClick={logoutClickHandler}
                id="add_people"
                className="btn"
              >
                Log Out
              </button>
            </div>
            { currentUser?.isShopOwner &&
            <div onClick={() => {
              navigate('/products')
            }} style={{ borderRadius: '5px', cursor: 'pointer', textAlign: 'center', transition: "height 0.3s ease-in-out" }} id="add_people">
             
              <svg style={{ color: '#18191B !important' }} xmlns="http://www.w3.org/2000/svg" width="26" height="26"  class="bi bi-dropbox" viewBox="0 0 16 16">
  <path d="M8.01 4.555 4.005 7.11 8.01 9.665 4.005 12.22 0 9.651l4.005-2.555L0 4.555 4.005 2 8.01 4.555Zm-4.026 8.487 4.006-2.555 4.005 2.555-4.005 2.555-4.006-2.555Zm4.026-3.39 4.005-2.556L8.01 4.555 11.995 2 16 4.555 11.995 7.11 16 9.665l-4.005 2.555L8.01 9.651Z"/>
</svg>
            </div>
              } 
            <div style={{ borderRadius: '5px', cursor: 'pointer', textAlign: 'center', padding: '5px', transition: "height 0.3s ease-in-out" }} id="add_people" onClick={() => {
              setToolBar(true)
            }}>
              <svg style={{ color: '#18191B !important' }} xmlns="http://www.w3.org/2000/svg" width="26" height="26" className="bi bi-dash-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z" />
              </svg>
            </div>

          </div>
        }
      </div>
      <div className="d-none d-md-block">

      </div>
      <div style={{ height: '100px', width: '300px' }}>
      </div>
      <div className="user-list-container mt-3">
        {getChatListWithOnlineUser()?.map((chatUser) => {

          return (
            <Link
              onClick={() => props.setCurrentChattingMember(chatUser)}
              to={`/c/${chatUser.roomId}`}
              className={
                "pl-1 list-group-item list-group-item-action border-0 " +
                getActiveChatClass(chatUser.roomId)
              }
              key={chatUser.id}
            >
              <div style={{ border: 'solid', borderWidth: '1px', borderColor: '#9F76EB', padding: '10px' }} className="d-flex align-items-start">
                <img
                  src={chatUser.image}
                  style={{ border: 'solid', borderColor: `${chatUser.isOnline ? '#14B86C' : '#9F77EB'}` }}
                  className="rounded-circle mr-1"
                  alt={chatUser.name}
                  width="40"
                  height="40"
                />
                <div className="flex-grow-1 ml-3">
                  <b>{chatUser.name}</b>
                  <div className="small">
                    {chatUser.isOnline ? (
                      <>
                        <span stlye={{ color: '#14B86C !important' }} className="fas fa-circle chat-online "></span>{" "}
                        Online
                      </>
                    ) : (
                      <>
                        <span className="fas fa-circle chat-offline"></span>{" "}
                        Offline
                      </>
                    )}
                  </div>
                </div>
                <span style={{ color: 'rgb(87, 97, 104)' }}>12:43 PM</span>
              </div>
            </Link>
          );
        })}
      </div>

      <hr className="d-block d-lg-none mt-1 mb-0" />

      <Modal
        modalCloseHandler={() => setIsShowAddPeopleModal(false)}
        show={isShowAddPeopleModal}
      >
        {users.length > 0 ? (
          users?.map((user) => (
            <div
              key={user.id}
              className="d-flex align-items-start pt-1 pb-1 d-flex align-items-center"
            >
              <img
                src={user.image}
                className="rounded-circle mr-1"
                alt={user.first_name + " " + user.last_name}
                width="40"
                height="40"
              />
              <div className="flex-grow-1 ml-2 mr-5">
                {user.first_name + " " + user.last_name}
              </div>
              <button
                onClick={() => addMemberClickHandler(user.id)}
                className="btn btn-sm btn-success"
              >
                Add
              </button>
            </div>
          ))
        ) : (
          <h3>No More User Found</h3>
        )}
      </Modal>
    </div>
  );
};

export default Sidebar;
