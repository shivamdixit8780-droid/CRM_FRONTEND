function Card({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div
      className={`
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-gray-200
        p-5
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-4">

          {title && (
            <h2 className="text-lg font-semibold text-gray-800">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}

        </div>
      )}

      {children}
    </div>
  );
}

export default Card;