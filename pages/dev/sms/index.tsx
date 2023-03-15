import Head from 'next/head'
import { useEffect, useRef, useState } from 'react';

export default function Sms() {
  const [ messages, setMessages ] = useState([]);
  const [ formData, setFormData ] = useState({
    message: '',
  });
  const inputRef = useRef();
  const messageListRef = useRef();

  const handleChange = (ev:Event) => {
    setFormData({
      ...formData,
      [ev?.target?.name]: ev?.target?.value,
    });
  };

  const onSend = (ev:Event) => {
    ev.preventDefault();
    if (formData.message !== '') {
      setFormData({
        message: '',
      });

      inputRef?.current?.focus();

      setMessages([...messages, {
        from: 'client',
        message: formData.message,
      }]);
    }
  };

  useEffect(() => {
    inputRef?.current?.focus();
  });

  useEffect(() => {
    // scroll to bottom of list
    messageListRef?.current?.scrollTo({
      top: 999999999, // using a stupidly large number to ensure we hit bottom
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen" data-theme="lemonade">
      <Head>
        <title>SMS Tester</title>
      </Head>

      <div className="flex-initial text-xl">
        <h1 className="text-6xl font-black text-center mb-8 text-green-700">
          SMS Tester
        </h1>
      </div>

      <div className="grow flex flex-col mx-auto w-1/2 overflow-auto">
        <h3 className="flex-none text-center">Messages</h3>
        <div ref={messageListRef} className="flex flex-col grow rounded-md border overflow-y-auto">
          {messages.map((o,i) => {
            return <div key={i} className={`chat ${o.from === 'client' ? 'chat-end' : 'chat-start'}`}>
              <div className={`chat-bubble ${o.from === 'client' ? 'chat-bubble-primary' : 'chat-bubble-info'}`} style={{whiteSpace: "pre-wrap"}}>
                {o.message}
              </div>
            </div>;
          })}
        </div>
      </div>

      <form onSubmit={onSend} className="flex-initial p-4 text-center">
        <input type="text" ref={inputRef} name="message" onChange={handleChange} value={formData?.message} className="input input-bordered w-full max-w-xs" />
        <button type="submit" className="btn btn-primary ml-2">Send</button>
      </form>
    </div>
  )
}
