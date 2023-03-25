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
import Chart from "./Chart";
import axios from 'axios';
let socket = new WebSocket(
  ServerUrl.WS_BASE_URL + `ws/users/${CommonUtil.getUserId()}/chat/`
);
let typingTimer = 0;
let isTypingSignalSent = false;

const ChatBody = ({ match, currentChattingMember, setOnlineUserList }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [typing, setTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [visible, setVisible] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  function handleImageClick() {
    console.log("Open");
    setShowImageModal(true);
  }

  function handleImageModalClose() {
    setShowImageModal(false);
  }
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
  const [sentiment, setSentiment] = useState({
    neg: 0.195,
    neu: 0.579,
    pos: 0.226,
    compound: -0.1068,
  });
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
    const onCopyClick = (text) => {
      setInputMessage(text);
      SnippetmessageSubmitHandler(text);
      const updatedSnippets = snippets.filter((snippet) => snippet !== text);
      setSnippets(updatedSnippets);
    }

    return (
      <div >
        <button style={{ position: 'relative', zIndex: '999', height: 'fit-content', width: 'fit-content', padding: '5px', borderWidth: '2px !important', backgroundColor: '#18191B', border: 'solid', borderRadius: '5px', borderColor: 'grey' }} onClick={handleCopyClick}>{text}</button>
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
          console.log(messagesState.results);
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
    if (!inputMessage && !selectedImage) {
      return; // Return early if no message or image is selected
    }

    if (!selectedImage) {
      // No image selected, send a text message
      socket.send(
        JSON.stringify({
          action: SocketActions.MESSAGE,
          message: inputMessage,
          user: CommonUtil.getUserId(),
          roomId: CommonUtil.getActiveChatId(match),
        })
      );
    } else {
      // An image is selected, send an image message
      const reader = new FileReader();
      console.log(selectedImage);
      reader.readAsDataURL(selectedImage);
      reader.onload = async (event) => {
        const imageBase64 = event.target.result;
        localStorage.setItem('myImage', imageBase64);
        console.log(selectedImage);
        socket.send(
          JSON.stringify({
            action: SocketActions.MESSAGE,
            image: imageBase64,
            user: CommonUtil.getUserId(),
            roomId: CommonUtil.getActiveChatId(match),
          })
        );
      };
      reader.onerror = (event) => {
        console.error(`FileReader error: ${event.target.error}`);
      };
     //reader.readAsDataURL(selectedImage);
  }

  // Clear the input message and selected image
  setInputMessage("");
  setSelectedImage(null);
};
const SnippetmessageSubmitHandler = (text) => {


  console.log(text);
  if (text) {
    socket.send(
      JSON.stringify({
        action: SocketActions.MESSAGE,
        message: text,
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
const getSentimentVal = async (input) => {
  console.log(input);
  try {
    const data = { message: input };
    const response = await axios.post("http://127.0.0.1:8000/api/v1/sentiment/", { 'message': input }
    );
    console.log(response.data.sentiment_scores);
    setSentiment(response.data.sentiment_scores);
  } catch (error) {
    console.log(error);
  }
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

function ImageModal(props) {


  function handleImageInputChange(event) {
    setSelectedImage(event.target.files[0]);
  }

  function handleSendClick() {
    // Do something with selectedImage, e.g. upload to server
    const event = new Event("build");
    messageSubmitHandler(event);
    props.onClose();
  }

  return (
    <div id="imageModal" style={{ zIndex: 999, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} role="dialog" aria-labelledby="imageModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content" style={{ border: 'solid', padding: '10px', borderRadius: '5px', zIndex: 999, backgroundColor: '#18191B', color: 'white' }}>
          <div className="modal-header">
            <h5 className="modal-title" id="imageModalLabel">Send Image</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={props.onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {selectedImage && (
              <img src={URL.createObjectURL(selectedImage)} alt="Selected Image" style={{ height: '100%', width: '100%', maxHeight: '50vh', maxWidth: '35vw' }} />
            )}
            <div className="form-group mt-3">
              <label htmlFor="imageInput">Select Image</label>
              <input type="file" className="form-control-file" id="imageInput" onChange={handleImageInputChange} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-danger " data-dismiss="modal" onClick={props.onClose}>Close</button>
            <button type="button" className="btn ml-2" style={{ backgroundColor: '#9D77EA' }} disabled={!selectedImage} onClick={handleSendClick}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="col-12 col-sm-8 col-md-8 col-lg-8 col-xl-10 pl-0 pr-0">
    <div style={{ position: 'absolute', top: '2%', right: '2%', display: 'flex', gap: '10px' }} >

      {snippets.map((snippet, index) => (
        <Snippet key={index} text={snippet} onClick={handleCopyClick} />
      ))}

    </div>
    {showImageModal && (
      <ImageModal onClose={handleImageModalClose} />
    )}
    <div style={{ backgroundColor: 'rgb(37, 56, 81)' }} className="py-2 px-4  d-none d-lg-block">
      <div className="d-flex align-items-center py-1">
        <div className="position-relative">



          <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div style={{ backgroundColor: '#181A1C' }} class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Sentiment Analysis</h5>
                  <button type="button" style={{ color: 'white !important' }} class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  {<div>

                    <Chart emotions={sentiment} />
                  </div>}
                </div>
                <div class="modal-footer">

                  <button type="button btn-close" style={{ backgroundColor: "#9D77EA" }} class="btn" data-bs-dismiss="modal" aria-label="Close">close</button>
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
         (message?.message || message?.image_data) && (
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
                <p style={{ color: 'white !important' }}>{CommonUtil.getTimeFromDate(message.timestamp)}</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#1C2A39' }} className="flex-shrink-1 ml-1 rounded py-2 px-3 mr-3">
           
           
              <div className="font-weight-bold mb-1">
                {message.userName}
                { message.message &&
                <button
                  type="button"
                  style={{ backgroundColor: '#1C2A39', border: 'none' }}
                  onClick={() => getSentimentVal(message.message)}
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-pie-chart-fill"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M15.985 8.5H8.207l-5.5 5.5a8 8 0 0 0 13.277-5.5zM2 13.292A8 8 0 0 1 7.5.015v7.778l-5.5 5.5zM8.5.015V7.5h7.485A8.001 8.001 0 0 0 8.5.015z"
                    />
                  </svg>
                </button>
              }
              </div>
              {message?.image_data ? (

                <img src={message?.image_data ? message?.image_data:'http://127.0.0.1:8000/'+message?.image_data}
                  alt="Image message" style={{ height: '100%', width: '100%', maxHeight: '50vh', maxWidth: '35vw' }} />
              ) : (
                <div>{message.message}</div>
              )}
      
            </div>
          </div>
         )
        
        ))}
      </div>
    </div>
    <div id="tools" style={{ backgroundColor: '#27292D' }} className="flex-grow-0 py-3 px-4 ">
      <form style={{ width: '80vw' }} onSubmit={messageSubmitHandler}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input
            onChange={(event) => setInputMessage(event.target.value)}
            onKeyUp={chatMessageTypingHandler}
            value={inputMessage}
            id="chat-message-input"
            type="text"
            className="form-control"
            placeholder="Write your Message..."
            autoComplete="off"
          />
          <button
            id="chat-message-submit"
            className="btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-send-fill" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
            </svg>
          </button>
          <div
            onClick={addSnippet}
            className="btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-clipboard2-plus-fill" viewBox="0 0 16 16">
              <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5Z" />
              <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585c.055.156.085.325.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5c0-.175.03-.344.085-.5ZM8.5 6.5V8H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V9H6a.5.5 0 0 1 0-1h1.5V6.5a.5.5 0 0 1 1 0Z" />
            </svg>
          </div>
          <div

            className="btn"
            onClick={handleImageClick}
          >

            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-card-image" viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
              <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z" />
            </svg>
          </div>
          <div

            className="btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-emoji-smile-fill" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zM4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8z" />
            </svg>

          </div>
          <div

            className="btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-paperclip" viewBox="0 0 16 16">
              <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z" />
            </svg>
          </div>
          <div

            className="btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-calendar-date-fill" viewBox="0 0 16 16">
              <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zm5.402 9.746c.625 0 1.184-.484 1.184-1.18 0-.832-.527-1.23-1.16-1.23-.586 0-1.168.387-1.168 1.21 0 .817.543 1.2 1.144 1.2z" />
              <path d="M16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-6.664-1.21c-1.11 0-1.656-.767-1.703-1.407h.683c.043.37.387.82 1.051.82.844 0 1.301-.848 1.305-2.164h-.027c-.153.414-.637.79-1.383.79-.852 0-1.676-.61-1.676-1.77 0-1.137.871-1.809 1.797-1.809 1.172 0 1.953.734 1.953 2.668 0 1.805-.742 2.871-2 2.871zm-2.89-5.435v5.332H5.77V8.079h-.012c-.29.156-.883.52-1.258.777V8.16a12.6 12.6 0 0 1 1.313-.805h.632z" />
            </svg>
          </div>
          <div className="btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </div>
          <div className="btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-robot" viewBox="0 0 16 16">
              <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z" />
              <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z" />
            </svg>
          </div>
          <div className="btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
            </svg>
          </div>
        </div>

      </form>
    </div>
  </div>
);
};

export default ChatBody;
