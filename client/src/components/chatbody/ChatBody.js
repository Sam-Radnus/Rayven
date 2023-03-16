import React, { useEffect, useState } from "react";
import ApiConnector from "../../api/apiConnector";
import ApiEndpoints from "../../api/apiEndpoints";
import ServerUrl from "../../api/serverUrl";
import Constants from "../../lib/constants";
import SocketActions from "../../lib/socketActions";
import CommonUtil from "../../util/commonUtil";
import "./chatBodyStyle.css";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";

let socket = new WebSocket(
  ServerUrl.WS_BASE_URL + `ws/users/${CommonUtil.getUserId()}/chat/`
);
let typingTimer = 0;
let isTypingSignalSent = false;

const ChatBody = ({ match, currentChattingMember, setOnlineUserList }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [typing, setTyping] = useState(false);
  const [sentiment, setSentiment] = useState('');
  const [visible,setVisible]=useState('');
  const fetchChatMessage = async () => {
    const currentChatId = CommonUtil.getActiveChatId(match);
    if (currentChatId) {
      const url =
        ApiEndpoints.CHAT_MESSAGE_URL.replace(
          Constants.CHAT_ID_PLACE_HOLDER,
          currentChatId
        ) + "?limit=20&offset=0";
      const chatMessages = await ApiConnector.sendGetRequest(url);
      setMessages(chatMessages);
    }
  };

  useEffect(() => {
    fetchChatMessage();
  }, [CommonUtil.getActiveChatId(match)]);

  const loggedInUserId = CommonUtil.getUserId();
  const getChatMessageClassName = (userId) => {
    return loggedInUserId === userId
      ? "chat-message-right pb-3"
      : "chat-message-left pb-3";
  };
  const [snippet, setSnippet] = useState('');

  
function Snippet({ text }) {
  const handleCopyClick = () => {
    onCopyClick(text);

  };
  const onCopyClick=(text)=>{
     setInputMessage(text);
     const updatedSnippets = snippets.filter((snippet) => snippet !== text);
     setSnippets(updatedSnippets);
  }
  return (
    <div >
      <button style={{position:'relative',zIndex:'999',height:'fit-content',width:'fit-content',padding:'5px',borderWidth:'2px !important',backgroundColor:'white',border:'solid',borderRadius:'5px',borderColor:'grey'}} onClick={handleCopyClick}>{text}</button>
    </div>
  );
}
 const [snippets, setSnippets] = useState([]);
 const addSnippet = () => {
  console.log(inputMessage)
  handleSnippetClick(inputMessage);
  setInputMessage('');
  setSnippet('');
};
  const handleSnippetClick = (snippet) => {
    setSnippets([...snippets, snippet]);
  };

  const handleCopyClick = (text) => {
    // copy text to input
    console.log(`Copying "${text}" to input...`);
  };
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const chatId = CommonUtil.getActiveChatId(match);
    const userId = CommonUtil.getUserId();
    if (chatId === data.roomId) {
      if (data.action === SocketActions.MESSAGE) {
        data["userImage"] = ServerUrl.BASE_URL.slice(0, -1) + data.userImage;
        setMessages((prevState) => {
          let messagesState = JSON.parse(JSON.stringify(prevState));
          messagesState.results.unshift(data);
          return messagesState;
        });
        setTyping(false);
      } else if (data.action === SocketActions.TYPING && data.user !== userId) {
        setTyping(data.typing);
      }
    }
    if (data.action === SocketActions.ONLINE_USER) {
      setOnlineUserList(data.userList);
    }
  };

  const messageSubmitHandler = (event) => {
    event.preventDefault();
    if (inputMessage) {
      socket.send(
        JSON.stringify({
          action: SocketActions.MESSAGE,
          message: inputMessage,
          user: CommonUtil.getUserId(),
          roomId: CommonUtil.getActiveChatId(match),
        })
      );
    }
    setInputMessage("");
  };

  const sendTypingSignal = (typing) => {
    socket.send(
      JSON.stringify({
        action: SocketActions.TYPING,
        typing: typing,
        user: CommonUtil.getUserId(),
        roomId: CommonUtil.getActiveChatId(match),
      })
    );
  };
  const getSentimentVal = (input) => {
    setSentiment(input);

    console.log(input);
  }

  const chatMessageTypingHandler = (event) => {
    if (event.keyCode !== Constants.ENTER_KEY_CODE) {
      if (!isTypingSignalSent) {
        sendTypingSignal(true);
        isTypingSignalSent = true;
      }
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        sendTypingSignal(false);
        isTypingSignalSent = false;
      }, 3000);
    } else {
      clearTimeout(typingTimer);
      isTypingSignalSent = false;
    }
  };

  return (
    <div className="col-12 col-sm-8 col-md-8 col-lg-8 col-xl-10 pl-0 pr-0">
        <div style={{position:'absolute',top:'2%',right:'2%',display:'flex',gap:'10px'}} >
     
      {snippets.map((snippet, index) => (
        <Snippet key={index} text={snippet} onClick={handleCopyClick} />
      ))}
    </div> 
      <div className="py-2 px-4 border-bottom d-none d-lg-block">
        <div className="d-flex align-items-center py-1">
          <div className="position-relative">


          
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    {<div>
                      <p>{sentiment}</p>
                    
                    </div>}
                  </div>
                  <div class="modal-footer">
                  
                    <button type="button" class="btn btn-primary">close</button>
                  </div>
                </div>
              </div>
            </div>

            <img
              src={currentChattingMember?.image}
              className="rounded-circle mr-1"
              alt="User"
              width="40"
              height="40"
            />
          </div>
          <div className="flex-grow-1 pl-3">
            <strong>{currentChattingMember?.name}</strong>
          </div>
        </div>
      </div>
      <div className="position-relative">

        <div
          id="chat-message-container"
          className="chat-messages pl-4 pt-4 pr-4 pb-1 d-flex flex-column-reverse"
        >
          {typing && (
            <div className="chat-message-left chat-bubble mb-1">
              <div className="typing">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}

          {messages?.results?.map((message, index) => (
            <div key={index} className={getChatMessageClassName(message.user)}>
              <div>
                <img
                  src={message.userImage}
                  className="rounded-circle mr-1"
                  alt={message.userName}
                  width="40"
                  height="40"
                />
                <div className="text-muted small text-nowrap mt-2">
                  {CommonUtil.getTimeFromDate(message.timestamp)}
                </div>
              </div>
              <div style={{ backgroundColor: message?.sentiment === "positive" ? '#BEF441' : message?.sentiment === "negative" ? "#F36464" : "#CCCCCC" }} className="flex-shrink-1 ml-1 rounded py-2 px-3 mr-3">
                <div className="font-weight-bold mb-1">{message.userName}
                  <button type="button" onClick={() => getSentimentVal(message?.emotion)} data-bs-toggle="modal" data-bs-target="#exampleModal">
                    X
                  </button>


                </div>
                {message.message}
              </div>

            </div>
          ))}
        </div>
      </div>
      <div className="flex-grow-0 py-3 px-4 border-top">
        <form onSubmit={messageSubmitHandler}>
          <div className="input-group">
            <input
              onChange={(event) => setInputMessage(event.target.value)}
              onKeyUp={chatMessageTypingHandler}
              value={inputMessage}
              id="chat-message-input"
              type="text"
              className="form-control"
              placeholder="Type your message"
              autoComplete="off"
            />
            <button
              id="chat-message-submit"
              className="btn btn-outline-warning"
            >
              Send
            </button>
            <div
              onClick={addSnippet}
              className="btn btn-outline-warning"
            >
              Snip it
            </div>
          
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBody;
