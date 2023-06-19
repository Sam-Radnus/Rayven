
import React, { useState ,useEffect } from 'react'
import axios from 'axios';
import Draggable from 'react-draggable';

import dotenv from 'dotenv';

const TextProcess = ({ showModal, handleCloseModal }) => {
  dotenv.config();
    const [action, setAction] = useState('');
    const [text, setText] = useState('');
    const [result,setResult]=useState('');
    const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(400);
   const [loading,setLoading] =useState(false);
   const [response,setResponse]=useState(false);
    const placeholder = {
        '::placeholder': {
            color: 'white'
        },
        color:'white',

        backgroundColor: "#18191B"

    };
    const toHTML = (message) => {
      if(!text || !response) return ;

        const tableRegex = /^(\|(?:.*?\|)+)(?:\r?\n)(\|(?:.*?\|)+)(?:\r?\n)((?::?-+:?\|)+)(?:\r?\n)((?:\|(?:.*?\|)+\r?\n)*)/gim; // table regex
        const codeRegex = /(`{3})([\s\S]*?)(\1)/gim; // code block regex
        const lines = message?.split(/\r?\n(?=\d+\. )/); // split message into lines at numbered list items
      
        return lines
          .map((line) => {
            return line
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
          })
          .join('<br/>');
      };
      
      

    
    // const processText=async()=>{
    //     setLoading(true);
    //     const options = {
    //         method: 'POST',
    //         headers: {
    //           accept: 'application/json',
    //           'content-type': 'application/json',
    //           'X-API-KEY': '12cb3418-c52d-4c78-8e64-e20ae9b3779b'
    //         },
    //         body: JSON.stringify({
    //           enable_google_results: 'true',
    //           enable_memory: false,
    //           input_text: text
    //         })
    //       };
        
    //       fetch('https://api.writesonic.com/v2/business/content/chatsonic?engine=premium', options)
    //         .then(response => response.json())
    //         .then(response => setResult(response?.message))
    //         .catch(err => console.error(err));
    //     setLoading(false);
    // }
    const processText = async () => {
        setLoading(true);
        setResponse(true);
        let api_key=process.env.REACT_APP_API_KEY
        console.log(api_key)
        if(!api_key) return;
        try {
          const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${api_key}`,
            },
            body: JSON.stringify({
              prompt: text,
              max_tokens: 200, // Adjust the desired length of the response
            }),
          });
    
          const data = await response.json();
          console.log(data);
          const { choices } = data;
          const output = choices[0].text.trim();
    
          setResult(output);
        } catch (error) {
          console.error('Error:', error);
        }
        setLoading(false);
      };

    useEffect(() => {
        const handleMouseMove = (event) => {
          if (event.ctrlKey && event.button === 0) {
            setWidth((prevWidth) => prevWidth + event.movementX);
            setHeight((prevHeight) => prevHeight + event.movementY);
          }
        };
    
        window.addEventListener('mousemove', handleMouseMove);
    
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }, []);
    return (
        <Draggable handle=".modal-content">
           
        <div style={{ display: "inline-block",opacity:'none',height:'fit-content',width:'fit-content' }} className="modal show" tabIndex="-1" role="dialog">
            {showModal &&
            
                <div className="modal-content"  role="document">
                    <div style={{ backgroundColor: "#18191B",  color: "#18191B" ,width: `${width}px`, height: `${height}px` }} className="modal-content">
                    
                        <div  className="modal-header">
                            <h5 className="modal-title">ChatBot</h5>
                            <button type="button" className="close" onClick={handleCloseModal} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                     
                        <div  className="modal-body">
                            <div style={{position:'relative'}} className="mb-3">
                                <input   type="email" style={placeholder} value={text} onChange={(e)=>{ setText(e.target.value)}} className="form-control" id="exampleFormControlInput1" />
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" style={{cursor:'pointer',position:'absolute',top:'120%',right:'0%'}} onClick={()=>{
                                  navigator.clipboard.writeText(result)

                                }}class="bi bi-clipboard2-fill" viewBox="0 0 16 16">
  <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5h3Z"/>
  <path d="M3.5 1h.585A1.498 1.498 0 0 0 4 1.5V2a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 12 2v-.5c0-.175-.03-.344-.085-.5h.585A1.5 1.5 0 0 1 14 2.5v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-12A1.5 1.5 0 0 1 3.5 1Z"/>
</svg>
                            </div>
                            
                            {loading ?
                          
                        
                            <div class="spinner-border text-light" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
               
                            : 
                           <div style={{marginTop:'30px'}} dangerouslySetInnerHTML={{ __html: toHTML(result) }}>
                             
                           </div>
                           }
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={()=>{
                                setResult('')
                                setText('')
                            }}>
                                Clear
                            </button>
                            <button type="button"  onClick={processText} className="btn btn" style={{ backgroundColor: "#9F78E9" }}>
                                Get Results
                            </button>
                        </div>
                        
                    </div>
                </div>
             
              }
        </div>
      
        </Draggable>

    )
}

export default TextProcess