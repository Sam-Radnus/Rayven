import React, { useState } from "react";
import './ResizableBox.css'
function Chatbox() {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [initialWidth, setInitialWidth] = useState(300);
  const [initialHeight, setInitialHeight] = useState(200);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    setOffsetX(e.nativeEvent.offsetX);
    setOffsetY(e.nativeEvent.offsetY);
  };
  const onChange=(e)=>{
    
  }
  const handleMouseUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging(false);
  };

  const handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (dragging) {
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      onChange({ x, y });
    }
  };


  return (
    <div
      className="resizable-box"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onResize={(e, data) => {
        onChange({ width: data.size.width, height: data.size.height });
      }}
      style={{ zIndex: 999999 }}
    >
      <div className="resizable-box-bar">
        <input type="text" placeholder="Enter question" />
      </div>
      <div className="resizable-box-content">
        <p>Answer</p>
      </div>
      <div className="resizable-box-corner-box"></div>
    </div>
  );
}

export default Chatbox;
