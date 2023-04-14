import React from "react";
import "./styles/Buttons.css";
// import CALCULATOR_BUTTONS from "./CalculatorButtons";

const Buttons = ({ inputHandler, clearInput, backspace, changePlusMinus, calculateAns }) => {
  document.addEventListener("keydown", function (event) {
    
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("equalbtn").click();
    }
  });

  return (
    <div className="show-btn">
      <button id="calc_btn"  className="btn exp" onClick={inputHandler}>
        ^
      </button>
      <button id="calc_btn" className="btn exp" onClick={inputHandler}>
        (
      </button>
      <button id="calc_btn" className="btn exp" onClick={inputHandler}>
        )
      </button>
      <button  id="calc_btn"className="btn exp" onClick={inputHandler}>
        √
      </button>
      <button  id="calc_btn"className="btn exp" onClick={inputHandler}>
        x<sup>2</sup>
      </button>
      <button id="calc_btn"className="btn clr" onClick={clearInput}>
        AC
      </button>
      <button id="calc_btn"  className="btn clr" onClick={backspace}>
        ⌫
      </button>
      <button  id="calc_btn" className="btn exp" onClick={inputHandler}>
        log
      </button>
      <button id="calc_btn"  className="btn exp" onClick={inputHandler}>
        ÷
      </button>
      <button  id="calc_btn" className="btn exp" onClick={inputHandler}>
        %
      </button>
      <button id="calc_btn"  className="btn" onClick={inputHandler}>
        7
      </button>
      <button  id="calc_btn" className="btn" onClick={inputHandler}>
        8
      </button>
      <button id="calc_btn"  className="btn" onClick={inputHandler}>
        9
      </button>
      <button id="calc_btn" className="btn exp" onClick={inputHandler}>
        x
      </button>
      <button id="calc_btn" className="btn exp" onClick={inputHandler}>
        x<sup>3</sup>
      </button>
      <button id="calc_btn" className="btn" onClick={inputHandler}>
        4
      </button>
      <button  id="calc_btn"className="btn" onClick={inputHandler}>
        5
      </button>
      <button id="calc_btn" className="btn" onClick={inputHandler}>
        6
      </button>
      <button  id="calc_btn"className="btn exp" onClick={inputHandler}>
        -
      </button>
      <button id="calc_btn" className="btn exp" onClick={inputHandler}>
        <sup>3</sup>√
      </button>
      <button id="calc_btn" className="btn" onClick={inputHandler}>
        1
      </button>
      <button  id="calc_btn" className="btn" onClick={inputHandler}>
        2
      </button>
      <button  id="calc_btn"className="btn" onClick={inputHandler}>
        3
      </button>
      <button  id="calc_btn"className="btn exp" onClick={inputHandler}>
        +
      </button>
      <button id="calc_btn" className="btn exp" onClick={inputHandler}>
        !
      </button>
      <button  id="calc_btn"className="btn exp" onClick={changePlusMinus}>
        ±
      </button>
      <button id="calc_btn" className="btn" onClick={inputHandler}>
        0
      </button>
      <button id="calc_btn" className="btn exp" onClick={inputHandler}>
        .
      </button>
      <button  id="calc_btn"className="btn exp equal"  onClick={calculateAns}>
        =
      </button>
    </div>
  );
};

export default Buttons;