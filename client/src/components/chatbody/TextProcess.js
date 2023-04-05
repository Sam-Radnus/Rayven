import React, { useState } from 'react'
import axios from 'axios';
const TextProcess = ({ showModal, handleCloseModal }) => {
    const [action, setAction] = useState('');
    const [text, setText] = useState('');
    const [result,setResult]=useState('');
    const placeholder = {
        '::placeholder': {
            color: 'white'
        },

        backgroundColor: "#18191B"

    };
    const processText=async()=>{
        console.log(text);
        const input = `${action}"${text}"`
        try{
           const data=await axios.post('http://127.0.0.1:8000/api/v1/response/',
               {
                   "message":input
               }
           )
          
           console.log(data?.data?.response);
           setResult(data?.data?.response);
        }
        catch(e){ console.log(e)}
        
    }
    return (

        <div style={{ display: "block" }} className="modal show" tabIndex="-1" role="dialog">
            {showModal &&
                <div className="modal-dialog" role="document">
                    <div style={{ backgroundColor: "#18191B", height: "50vh", color: "#18191B" }} className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Enter Text</h5>
                            <button type="button" className="close" onClick={handleCloseModal} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <input type="email" style={placeholder} value={text} onChange={(e)=>{ setText(e.target.value)}} className="form-control" id="exampleFormControlInput1" />
                            </div>
                            <div className="input-group mb-3">


                                <input style={{ backgroundColor: "#18191B", color: "white" }} value={action} onChange={(e)=>{ setAction(e.target.value)}}  type="text" className="form-control" aria-label="Text input with dropdown button" />
                                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Dropdown</button>
                                <ul style={{ backgroundColor: "#18191B", color: "#18191B" }} className="dropdown-menu dropdown-menu-end">
                                    <li onClick={()=>{setAction("Write a Reply for the Message")}}><a  className="dropdown-item danger text-danger" href="#"><span>Reply</span></a></li>
                                    <li onClick={()=>{setAction("Write a Refusal for the Message")}}><a  className="dropdown-item danger text-danger" href="#"><span>Refusal</span></a></li>
                                    <li onClick={()=>{setAction("Explain the meaning behind this Message")}}><a  className="dropdown-item danger text-danger" href="#"><span>Decipher</span></a></li>
                                   
                                </ul>
                            </div>
                           <div>
                             {result}
                           </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                Close
                            </button>
                            <button type="button"  onClick={processText} className="btn btn" style={{ backgroundColor: "#9F78E9" }}>
                                Get Results
                            </button>
                        </div>
                        
                    </div>
                </div>
            }
        </div>

    )
}

export default TextProcess