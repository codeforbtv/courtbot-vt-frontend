import Head from 'next/head'
import { useEffect, useRef, useState } from 'react';

export function getStaticProps() {
  return {
    // returns the default 404 page with a status code of 404 when not development
    notFound: process.env.NODE_ENV !== 'development',
    props: {},
  };
}

export default function Sms() {
  const [ messages, setMessages ] = useState([]);
  const [ formData, setFormData ] = useState({
    Body: '',
  });
  const formRef = useRef();
  const inputRef = useRef();
  const messageListRef = useRef();

  const handleChange = (ev) => {
    setFormData({
      ...formData,
      [ev?.target?.name]: ev?.target?.value,
    });
  };

  const onSend = (ev) => {
    ev.preventDefault();
    if (formData.message !== '') {
      // construct client message
      const clientMessage = {
        from: 'client',
        message: formData.Body,
      };

      const xhrFormData = new FormData(formRef.current);
      // send message
      fetch('/api/sms/vt', {
        method: "POST",
        body: new URLSearchParams(xhrFormData),
      })
        .then(response => response.text())
        .then(xmlStr => {
          // grab server message
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlStr, "application/xml");

          // append the messages
          setMessages([...messages,
            // HACK: need to re-add client message due to possible react timing issue and using old messages array
            clientMessage,
            {
              from: 'server',
              message: xmlDoc.querySelector('Message')?.textContent,
            }
          ]);

        });

      // clear the input
      setFormData({
        Body: '',
      });
      inputRef?.current?.focus();

      // append the message
      setMessages([...messages, clientMessage]);
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

      <form ref={formRef} onSubmit={onSend} className="flex-initial p-4 text-center">
        <input type="hidden" name="From" value={`+1${process.env.NEXT_PUBLIC_PHONE_NUMBER?.replaceAll('-','')}`} />
        <input type="text" ref={inputRef} name="Body" onChange={handleChange} value={formData?.Body} className="input input-bordered w-full max-w-xs" />
        <button type="submit" className="btn btn-primary ml-2">Send</button>
      </form>
    </div>
  )
}
