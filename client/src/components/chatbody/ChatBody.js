import React, { useEffect, useState } from "react";
import ApiConnector from "../../api/apiConnector";
import ApiEndpoints from "../../api/apiEndpoints";
import ServerUrl from "../../api/serverUrl";
import Constants from "../../lib/constants";
import SocketActions from "../../lib/socketActions";
import CommonUtil from "../../util/commonUtil";
import CookieUtil from "../../util/cookieUtil";
import "./chatBodyStyle.css";
import { Resizable, ResizableBox } from 'react-resizable';

import "./TextProcess.css"
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import Calculator from "./Calculator";
import "bootstrap/dist/css/bootstrap.min.css";
import Chart from "./Chart";
import axios from 'axios';
import openai from 'openai';

import TextProcess from "./TextProcess";
import Sidebar from "./Sidebar";
let socket = new WebSocket(
  ServerUrl.WS_BASE_URL + `ws/users/${CommonUtil.getUserId()}/chat/`
);
let typingTimer = 0;
let isTypingSignalSent = false;

const ChatBody = ({ match, currentChattingMember, setOnlineUserList }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [owner, setOwner] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [visible, setVisible] = useState('');
  const [productModal, setProductModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [calcModal, setCalcModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [tools, setTools] = useState(false);
  const [box,setBox]=useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }
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

  const navigate = useNavigate();
  function handleImageClick() {
    console.log("Open");
    setShowImageModal(true);
  }

  function handleImageModalClose() {

    setShowImageModal(false);
  }
  function handleProductModalClose() {
    setProductModal(false);
  }
  useEffect(() => {
    console.log("Hey Ho")
    console.log(window.location.pathname.slice(3,));
    fetchChatMessage();
  }, [window.location.pathname])
  const fetchChatMessage = async () => {

    const currentChatId = CommonUtil.getActiveChatId(currentChattingMember);
    console.log(currentChattingMember.roomId);
    console.log(currentChatId);
    if (true) {
      const url =
        ApiEndpoints.CHAT_MESSAGE_URL.replace(
          Constants.CHAT_ID_PLACE_HOLDER,
          currentChattingMember.roomId
        ) + "?limit=20&offset=0";
      const chatMessages = await ApiConnector.sendGetRequest(url);
      setMessages(chatMessages);

    }
  };
  // const loadModel = async () => {
  //   const model = await qna.load();
  //   return model;
  // };

  // // Generate possible replies for a given text
  // const generateReplies = async (text) => {
  //   const model = await loadModel();
  //   console.log(text);
  //   console.log(model);
  //   const answers = await model.findAnswers(text, "Sarah provides information on the warranty and return policy and offers to help John with any further questions he may have.");
  //   const replies = answers.map((answer) => answer.text);
  //   console.log(answers)
  //   return replies;
  // };
  const [sentiment, setSentiment] = useState({
    neg: 0.195,
    neu: 0.579,
    pos: 0.226,
    compound: -0.1068,
  });
  useEffect(() => {
    console.log(CommonUtil.getUserId());
    fetchChatMessage();
  }, [window.location.pathname.slice(3,)]);

  const loggedInUserId = CommonUtil.getUserId();
  const getChatMessageClassName = (userId) => {
    return loggedInUserId === userId
      ? "chat-message-right pb-3"
      : "chat-message-left pb-3";
  };
  const [snippet, setSnippet] = useState('');

  async function generateResponse(prompt) {
    const response = await openai.completions.create({
      engine: 'davinci',
      prompt: prompt,
      max_tokens: 50,
      n: 1,
      stop: '\n',
    });
    console.log(response);
    return response.data.choices[0].text.trim();
  }

  async function fetchData(input) {

    // try {

    //   console.log(openai);
    //   const response = await generateResponse("What is the Meaning of Life?");
    //   console.log(response);
    // } catch (err) {
    //   console.log(err);
    // }
  }
  const addToCart = (product) => {
    const updatedCartItems = [...cartItems, product];
    setCartItems(updatedCartItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
  }

  useEffect(() => {

    console.log(currentChattingMember);
    const user_id = currentChattingMember?.id
    sessionStorage.setItem('business_id',currentChattingMember?.id);
    console.log(user_id);
    getUserDetails();
    axios.post('http://127.0.0.1:8000/api/v1/isShopOwner/', {
      id: user_id // Replace with the actual user ID you want to check
    })

      .then(function (response) {
        console.log(response)
        console.log(response?.data?.isShopOwner);
        setOwner(response?.data?.isShopOwner);
      })
      .catch(function (error) {
        console.log(error);
      });

  }, [currentChattingMember])
  const getUserDetails = async () => {

    console.warn(currentChattingMember?.id);
    try {


      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/getUserProfile",
        {

          'user_id': `${currentChattingMember?.id}`

        }
      );

      console.log(response)
      setUserInfo(response?.data?.User)
    } catch (error) {
      console.error(error);
    }
  };
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
  //openai.configure(config);

  const [showModal, setShowModal] = useState(false);
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
    const chatId = window.location.pathname.slice(3,);
    const userId = CommonUtil.getUserId();

    if (messages && messages?.results) console.log(messages?.results[0]?.message);
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
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenProductModal = async () => {

    console.warn(CommonUtil.getUserId());
    try {


      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/getProducts",
        {

          'user_id': `${CommonUtil.getUserId()}`

        }
      );

      console.log(response?.data?.products?.products)
      setProducts(response?.data?.products?.products);
    } catch (error) {
      console.error(error);
    }
    setProductModal(true);
  }
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
          roomId: window.location.pathname.slice(3,),
        })
      );
    } else {
      // An image is selected, send an image message
      const reader = new FileReader();
      console.log(selectedImage);
      reader.readAsDataURL(selectedImage);
      reader.onload = async (event) => {
        const imageBase64 = event.target.result;
        console.log(selectedImage);
        socket.send(
          JSON.stringify({
            action: SocketActions.MESSAGE,
            image: imageBase64,
            user: CommonUtil.getUserId(),
            roomId: window.location.pathname.slice(3,),
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
          roomId: window.location.pathname.slice(3,),
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
        roomId: window.location.pathname.slice(3,),
      })
    );
  };

  const getSentimentVal = async (input) => {
    console.log(input);
    const text = 'How do I create a React app?';
    fetchData(input);
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
  const getResponses = async (input) => {
    console.log(input);
    fetchData(input);
    try {
      const data = { message: input };
      const response = await axios.post("127.0.0.1:8000/api/v1/response/", { 'message': input }
      );
      console.log(response.message);
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

  const toHTML2 = (message) => {
    const tableRegex = /^(\|(?:.*?\|)+)(?:\r?\n)(\|(?:.*?\|)+)(?:\r?\n)((?::?-+:?\|)+)(?:\r?\n)((?:\|(?:.*?\|)+\r?\n)*)/gim; // table regex
    const codeRegex = /(`{3})([\s\S]*?)(\1)/gim; // code block regex
    return message
      .replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
      .replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
      .replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text
      .replace(/\*(.*)\*/gim, '<i>$1</i>') // italic text
      .replace(tableRegex, '<table><thead><tr>$1</tr></thead><tbody>$2</tbody></table>') // table
      .replace(/(<table>[\s\S]*<\/table>)/gm, '<div className="table-responsive">$1</div>') // table responsive
      .replace(codeRegex, '<pre><code>$2</code></pre>') // code block
      .replace(/(?:\r?\n)(?:\|[\s\S]*?\|)(?:\r?\n)(?:\|(?:-+:|-+:|:-+:|:-+){2,}\|)(?:\r?\n)(?:\|[\s\S]*?\|)*(?:\r?\n)?/gm, match => {
        const rows = match.trim().split('\n').map(row => row.trim().split('|').slice(1, -1).map(cell => cell.trim()));
        const headers = rows.shift();
        return `
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(cells => `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;
      });

  }
  const toHTML3 = (message) => {
    const tableRegex = /^(\|(?:.*?\|)+)(?:\r?\n)(\|(?:.*?\|)+)(?:\r?\n)((?::?-+:?\|)+)(?:\r?\n)((?:\|(?:.*?\|)+\r?\n)*)/gim; // table regex
    const codeRegex = /(`{3})([\s\S]*?)(\1)/gim; // code block regex
    return message
      .replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
      .replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
      .replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text
      .replace(/\*(.*)\*/gim, '<i>$1</i>') // italic text
      .replace(tableRegex, '<table><thead><tr>$1</tr></thead><tbody>$2</tbody></table>') // table
      .replace(/(<table>[\s\S]*<\/table>)/gm, '<div className="table-responsive">$1</div>') // table responsive
      .replace(codeRegex, '<pre><code>$2</code></pre>') // code block
      .replace(/(?:\r?\n)(?:\|[\s\S]*?\|)(?:\r?\n)(?:\|(?:-+:|-+:|:-+:|:-+){2,}\|)(?:\r?\n)(?:\|[\s\S]*?\|)*(?:\r?\n)?/gm, match => {
        const rows = match.trim().split('\n').map(row => row.trim().split('|').slice(1, -1).map(cell => cell.trim()));
        const headers = rows.shift();
        return `
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(cells => `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;
      })
      .replace(/<button onClick=\\"(.*?)\\" className=\\"btn btn-warning\\">Add to Cart<\/button>/gim, '<button onClick="$1" className="btn btn-warning">Add to Cart</button>');
  };
  const toHTML = (message) => {
    const tableRegex = /^(\|(?:.*?\|)+)(?:\r?\n)(\|(?:.*?\|)+)(?:\r?\n)((?::?-+:?\|)+)(?:\r?\n)((?:\|(?:.*?\|)+\r?\n)*)/gim; // table regex
    const codeRegex = /(`{3})([\s\S]*?)(\1)/gim; // code block regex
    return message
      .replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
      .replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
      .replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text
      .replace(/\*(.*)\*/gim, '<i>$1</i>') // italic text
      .replace(tableRegex, '<table><thead><tr>$1</tr></thead><tbody>$2</tbody></table>') // table
      .replace(/(<table>[\s\S]*<\/table>)/gm, '<div className="table-responsive">$1</div>') // table responsive
      .replace(codeRegex, '<pre><code>$2</code></pre>') // code block
      .replace(/(?:\r?\n)(?:\|[\s\S]*?\|)(?:\r?\n)(?:\|(?:-+:|-+:|:-+:|:-+){2,}\|)(?:\r?\n)(?:\|[\s\S]*?\|)*(?:\r?\n)?/gm, match => {
        const rows = match.trim().split('\n').map(row => row.trim().split('|').slice(1, -1).map(cell => cell.trim()));
        const headers = rows.shift();
        return `
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(cells => `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;
      })
      .replace(/<button className=\\"btn btn-warning\\" onClick=\{?\(\)\=\>?\{?alert\(&quot;Hello\)&quot;\}?}?>(.*?)<\/button>/gim, '<button className="btn btn-warning" onClick={()=>{alert("Hello")}}>$1</button>')
      .replace(/<button onClick={\(\)=>{alert\(&quot;hello&quot;\)}}>add to cart<\/button>/gim, '<button onClick={()=>{alert("hello")}}>add to cart</button>');
  }

  const handleKeyDown = (event) => {
    if (event.keyCode === 13 && event.shiftKey) {
      event.preventDefault();
      setInputMessage(inputMessage + '\n');
    }
  };
  function ProductCard({ product, productState, addToCart }) {
    return (
      <div className="card" style={{ width: "18rem", backgroundColor: "#18191B" }}>
        <img src={product.image_url} className="card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text">$ {productState.price}</p>
          <button
            onClick={() => {
              const pd = {
                name: product.name,
                price: product.price,
              };
              addToCart(pd);
            }}
            className="btn btn-warning"
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  }
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

  function ProductModal(props) {
    const [productStates, setProductStates] = useState(products.map(() => ({
      name: '',
      id:'',
      price: '',
      isSending: false
    })));
    const alterProduct=async(product)=>{
      console.log(product);
      const change=await axios.post("http://127.0.0.1:8000/api/v1/changePrice/",{
        "id":product.id,
        "price":product.price
      })
      console.log(change);
    }
    
    function sendProduct(productIndex) {
      const product = products[productIndex];
      
      const productState = productStates[productIndex];
      console.log(productState);
      alterProduct(productState);
      const newProductStates = [...productStates];
      newProductStates[productIndex] = { ...productState, isSending: true };
      setProductStates(newProductStates);
      const event = new Event("build");
      const message = `<div class='card' style='width: 18rem; background-color: #18191B;'>
    <img src=${product.image_url} class='card-img-top' alt='...'>
    <div class='card-body'>
      <h5 class='card-title'>${product.name}</h5>
      <p class='card-text'>$${productState.price}</p>
     <a href="/payments"><button id="cost" class="btn btn-warning">Add to Cart</button></a>
      
    </div>
    <script>
      const element=document.getElementById('cost');
      console.log(element);
      element.addEventListener("click", myFunction);
      
      function myFunction() {
        console.log("Hello")
        alert("Hello");
      }
      </script>
  </div>`;
      console.log(message);

      
      setProductStates(newProductStates);
      socket.send(
        JSON.stringify({
          action: SocketActions.MESSAGE,
          message: message,
          user: CommonUtil.getUserId(),
          roomId: window.location.pathname.slice(3,),
        })
      );
      // Send the product
      // ...

      // Update the state when the product has been sent
      
      const updatedProductState = { ...productState, isSending: false };
      console.log(updatedProductState)
      newProductStates[productIndex] = updatedProductState;
      setProductModal(false);
    }

    return (
      <div style={{ zIndex: 999, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', height: 'fit-content', width: 'fit-content' }} role="dialog" aria-labelledby="imageModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content" style={{ border: 'solid', padding: '10px', borderRadius: '5px', zIndex: 999, backgroundColor: '#18191B', color: 'white', height: '50vh', width: '50vw' }}>
            <div className="modal-header">
              <h5 className="modal-title" style={{ textAlign: 'center' }} id="imageModalLabel">Send Products</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={props.onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {products.map((product, index) => (
                
                <div className="my-3" style={{ display: 'flex', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '48vw' }}>
                 
                  <img src={product?.image_url} alt="product image" height="60" width="60" />
                  <h5>{product?.name}</h5>
                  <input type="number" value={productStates[index]?.price ? productStates[index]?.price : product?.price} onChange={(e) => {
                    const newProductStates = [...productStates];
                    
                    newProductStates[index] = { ...productStates[index], id:product?.id,name:product?.name,price: e.target.value };
                  
                    setProductStates(newProductStates);
                    
                  }} />
                  <button className="btn btn-primary" onClick={() => { sendProduct(index) }} disabled={productStates[index]?.isSending}>
                    {productStates[index]?.isSending ? 'Sending...' : 'SEND'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ToolKit(props) {
    return (


      <div style={{ boxShadow: '0 0 10px rgba(159, 119, 235, 0.5)', width:tools?'200px':'90px',transition: "height 0.3s ease", backgroundColor: '#18191B', padding: '20px' }}>
        {!tools ?
          <div

            className="btn"
            onClick={() => {
              setTools(true)
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-nut-fill" viewBox="0 0 16 16">
              <path d="M4.58 1a1 1 0 0 0-.868.504l-3.428 6a1 1 0 0 0 0 .992l3.428 6A1 1 0 0 0 4.58 15h6.84a1 1 0 0 0 .868-.504l3.429-6a1 1 0 0 0 0-.992l-3.429-6A1 1 0 0 0 11.42 1H4.58zm5.018 9.696a3 3 0 1 1-3-5.196 3 3 0 0 1 3 5.196z" />
            </svg>

          </div> :
          <div >
            <div
              onClick={addSnippet}
              className="btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-clipboard2-plus-fill" viewBox="0 0 16 16">
                <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5Z" />
                <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585c.055.156.085.325.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5c0-.175.03-.344.085-.5ZM8.5 6.5V8H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V9H6a.5.5 0 0 1 0-1h1.5V6.5a.5.5 0 0 1 1 0Z" />
              </svg>
            </div>
            <div

              className="btn"
              onClick={handleImageClick}
            >

              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-card-image" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z" />
              </svg>
            </div>
            <div

              className="btn"
              onClick={() => {
                setCalcModal(true)
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-calculator-fill" viewBox="0 0 16 16">
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5zm0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1z" />
              </svg>

            </div>
            <div className="btn" onClick={() => {
              if (snippets) setSnippets([]);
            }}>


              <svg style={{ color: 'white' }} xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
              </svg>


            </div>
            <div

              className="btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
              </svg>
            </div>
            <div

              className="btn"
              onClick={() => {
                let open = isOpen;
                setIsOpen(!open);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
              </svg>
            </div>
            <div className="btn" onClick={handleOpenProductModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </div>
            <div className="btn" onClick={handleOpenModal} >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
                <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z" />
                <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z" />
              </svg>
            </div>
            <div className="btn" onClick={() => {
              setTools(false)
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-dash-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z" />
              </svg>
            </div>
          </div>
        }
      </div>
    );
  }
  const closeCalcModal = () => {

    setCalcModal(false);
  }
  return (
    <div className=" col-12 col-sm-8 col-md-8 col-lg-8 col-xl-10 pl-0 pr-0">
      {isOpen && userInfo &&
        <Sidebar userInfo={userInfo} />
      }
      <div style={{ position: 'absolute', top: '2%', right: '2%', display: 'flex', gap: '10px' }} >

        {snippets.map((snippet, index) => (
          <Snippet key={index} text={snippet} onClick={handleCopyClick} />
        ))}

      </div>
      {showImageModal && (
        <ImageModal onClose={handleImageModalClose} />
      )}
      {productModal && (
        <ProductModal onClose={handleProductModalClose} />
      )}
      {showModal && (
        <Resizable
        width={300}
        height={400}
        minConstraints={[200, 200]}
        maxConstraints={[800, 800]}
      >
        <TextProcess showModal={showModal} handleCloseModal={handleCloseModal} />
        </Resizable>
      )}
      {calcModal && (
        <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
          <Calculator handleCloseCalclModal={closeCalcModal} />
        </div>
      )}
      <div
        style={{ position: 'absolute', zIndex: '9999999', left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <ToolKit />

      </div>
      
      <div style={{ backgroundColor: 'rgb(37, 56, 81)' }} className="py-2 px-4  d-none d-lg-block">

        <div className="d-flex align-items-center py-1">
          <div className="position-relative">


            <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered">
                <div style={{ backgroundColor: '#181A1C' }} className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Sentiment Analysis</h5>
                    <button type="button" style={{ color: 'white !important' }} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {<div>

                      <Chart emotions={sentiment} />
                    </div>}
                  </div>
                  <div className="modal-footer">

                    <button type="button btn-close" style={{ backgroundColor: "#9D77EA" }} className="btn" data-bs-dismiss="modal" aria-label="Close">close</button>
                  </div>
                </div>
              </div>
            </div>

            <img
              src={currentChattingMember?.image}
              style={{border:'solid',borderColor:'#9F77EB'}}
              className="rounded-circle mr-1"
              alt="User"
              width="40"
              height="40"
            />
          </div>
          <div style={{fontSize:'20px'}} className="flex-grow-1 pl-3">
            <strong >{currentChattingMember?.name}</strong>
            <b>{owner ? `(Business)` : ''}</b>
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
              <div key={index} style={{ transition: 'opacity 0.5 ease' }} className={getChatMessageClassName(message.user)}>
                <div>
                  <img
                    src={message.userImage}
                    className="rounded-circle mr-1"
                    alt={message.userName}
                    width="40"
                    height="40"
                  />
                  <div className="text-muted small text-nowrap mt-2">

                  </div>
                </div>
                <div style={{ backgroundColor: '#1C2A39' }} className="flex-shrink-1 ml-1 rounded py-2 px-3 mr-3">


                  <div className="font-weight-bold mb-1">
                    {message.userName}
                    {message.message &&
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
                          className="bi bi-pie-chart-fill"
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

                    <img src={message?.image_data ? message?.image_data : 'http://127.0.0.1:8000/' + message?.image_data}
                      alt="Image message" style={{ height: '100%', width: '100%', maxHeight: '50vh', maxWidth: '35vw' }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: toHTML(message?.message) }}></div>
                  )}
                  <div style={{ position: 'relative', height: '30px' }}>
                    <p style={{ position: 'absolute', bottom: '-50%', right: '0', color: 'white !important' }}>{CommonUtil.getTimeFromDate(message.timestamp)}</p>
                  </div>
                </div>
              </div>
            )

          ))}
        </div>
      </div>

      <div id="tools" style={{ backgroundColor: '#27292D' }} className="flex-grow-0 py-3 px-4 ">
        <form style={{ width: '80vw' }} onSubmit={messageSubmitHandler}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <textarea

              onChange={(event) => setInputMessage(event.target.value)}
              onKeyUp={chatMessageTypingHandler}
              value={inputMessage}
              onKeyDown={handleKeyDown}
              style={{ backgroundColor: '#344153',paddingTop:'13px',borderRadius:'30px', height: '50px', resize: 'none', color: 'white' }}
              id="chat-message-input"
              type="text"
              className="form-control"

              autoComplete="off"
            />
            <button
              id="chat-message-submit"
              className="btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
              </svg>
            </button>
            {/* <div
              onClick={addSnippet}
              className="btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-clipboard2-plus-fill" viewBox="0 0 16 16">
                <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5Z" />
                <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585c.055.156.085.325.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5c0-.175.03-.344.085-.5ZM8.5 6.5V8H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V9H6a.5.5 0 0 1 0-1h1.5V6.5a.5.5 0 0 1 1 0Z" />
              </svg>
            </div>
            <div

              className="btn"
              onClick={handleImageClick}
            >

              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-card-image" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z" />
              </svg>
            </div>
            <div
           
              className="btn"
              onClick={()=>{
                setCalcModal(true)
              }}
            >
             <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-calculator-fill" viewBox="0 0 16 16">
  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5zm0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1z"/>
</svg>

            </div>
            <div

              className="btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
</svg>
            </div>
            <div

              className="btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-calendar-date-fill" viewBox="0 0 16 16">
                <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zm5.402 9.746c.625 0 1.184-.484 1.184-1.18 0-.832-.527-1.23-1.16-1.23-.586 0-1.168.387-1.168 1.21 0 .817.543 1.2 1.144 1.2z" />
                <path d="M16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-6.664-1.21c-1.11 0-1.656-.767-1.703-1.407h.683c.043.37.387.82 1.051.82.844 0 1.301-.848 1.305-2.164h-.027c-.153.414-.637.79-1.383.79-.852 0-1.676-.61-1.676-1.77 0-1.137.871-1.809 1.797-1.809 1.172 0 1.953.734 1.953 2.668 0 1.805-.742 2.871-2 2.871zm-2.89-5.435v5.332H5.77V8.079h-.012c-.29.156-.883.52-1.258.777V8.16a12.6 12.6 0 0 1 1.313-.805h.632z" />
              </svg>
            </div>
            <div className="btn" onClick={handleOpenProductModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </div>
            <div className="btn" onClick={handleOpenModal} >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
                <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z" />
                <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z" />
              </svg>
            </div>
            <div className="btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
              </svg>
            </div> */}
          </div>

        </form>
      </div>

    </div>
  );
};

export default ChatBody;
