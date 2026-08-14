import "../../styles/Input.css";

function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  required = false,
  disabled = false,
  error = "",
  className = "",
}) {
  return (
    <div className="input-wrapper">

      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-field ${error ? "input-error" : ""} ${className}`}
      />

      {error && (
        <p className="input-error-text">
          {error}
        </p>
      )}

    </div>
  );
}

export default Input;