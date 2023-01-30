import Head from 'next/head'
import { useRef, useState } from 'react';

export default function Sms() {
  const messages = useState([]);
  const [ formData, setFormData ] = useState({});
  const textareaRef = useRef();

  const handleChange = (ev:Event) => {
    setFormData({
      ...formData,
      [ev?.target?.name]: ev?.target?.value,
    });
  };

  const onSend = (ev:Event) => {
    ev.preventDefault();
    setFormData({
      message: '',
    });
    textareaRef?.current?.focus();
    console.log(formData);
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>SMS Tester</title>
      </Head>

      <div className="flex-none text-xl">
        <h1 className="text-6xl font-black text-center mb-8 text-green-700">
          SMS Tester
        </h1>
      </div>

      <div className="grow">
        Messages
      </div>

      <div className="flex-none">
        <form onSubmit={onSend}>
          <textarea ref={textareaRef} name="message" onChange={handleChange} value={formData?.message} />
          <button type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
