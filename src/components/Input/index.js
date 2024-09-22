import React from "react";
import "./styles.css";

function InputComponent({label, state, setState, placeholder, type}) {
  return (
    <div className="input-wrapper">
      <p className="label-input">{label}</p>
      <input
        type={type}
        className="custom-input"
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default InputComponent;
