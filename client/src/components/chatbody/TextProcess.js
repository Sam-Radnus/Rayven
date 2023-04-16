import React, { useState ,useEffect } from 'react'
import axios from 'axios';
import Draggable from 'react-draggable';


const TextProcess = ({ showModal, handleCloseModal }) => {
    const [action, setAction] = useState('');
    const [text, setText] = useState('');
    const [result,setResult]=useState('');
    const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(400);
   const [loading,setLoading] =useState(false);
    const placeholder = {
        '::placeholder': {
            color: 'white'
        },
        color:'white',

        backgroundColor: "#18191B"

    };
    const toHTML = (message) => {
        const tableRegex = /^(\|(?:.*?\|)+)(?:\r?\n)(\|(?:.*?\|)+)(?:\r?\n)((?::?-+:?\|)+)(?:\r?\n)((?:\|(?:.*?\|)+\r?\n)*)/gim; // table regex
        const codeRegex = /(`{3})([\s\S]*?)(\1)/gim; // code block regex
        const lines = message.split(/\r?\n(?=\d+\. )/); // split message into lines at numbered list items
      
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
        const options = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': ''
          },
          body: JSON.stringify({
            enable_google_results: 'true',
            enable_memory: false,
            input_text: text
          })
        };
      
        try {
          const response = await fetch(
            'https://api.writesonic.com/v2/business/content/chatsonic?engine=premium',
            options
          );
          const data = await response.json();
          setResult(data?.message);
        } catch (error) {
          console.error(error);
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
                            <h5 className="modal-title">Enter Text</h5>
                            <button type="button" className="close" onClick={handleCloseModal} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div  className="modal-body">
                            <div className="mb-3">
                                <input   type="email" style={placeholder} value={text} onChange={(e)=>{ setText(e.target.value)}} className="form-control" id="exampleFormControlInput1" />
                            </div>
                            {loading ?
                          
                        
                            <div class="spinner-border text-light" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>


            
                            : 
                           <div  dangerouslySetInnerHTML={{ __html: toHTML(result) }}>

                             
                           </div>
                           }
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={()=>{
                                setResult('')
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