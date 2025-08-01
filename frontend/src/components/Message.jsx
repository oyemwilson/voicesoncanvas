const Message = ({ variant, children }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 border border-green-400 text-green-700';
      case 'danger':
        return 'bg-red-100 border border-red-400 text-red-700';
      default:
        return 'bg-blue-100 border border-blue-400 text-blue-700';
    }
  };

  return <div className={`px-4 py-3 rounded relative ${getVariantClass()}`}>{children}</div>;
};

Message.defaultProps = {
  variant: 'info',
};

export default Message;
