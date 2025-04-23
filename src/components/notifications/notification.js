const Close = ({}) => {
    return (
        <></>
    )
}
export default function Notification({ type, text, children }) {
  return (
    <div className="">
      <div className={`w-1 h-full rounded-full`}/>
      <div>
        <span>{text}:</span>
        {children}
      </div>
      <div>
        
      </div>
    </div>
  );
}
