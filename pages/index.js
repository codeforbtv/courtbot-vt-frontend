import Head from 'next/head'

export default function Home() {
  return (
    <div className="flex flex-row-reverse flex-wrap p-8">
      <Head>
        <title>Vermont CourtBot</title>
      </Head>

      <div className="w-full md:w-2/3 text-xl">
        <h1 className="text-6xl font-black text-center mb-8 text-green-700">
          Vermont CourtBot
        </h1>
        <h2 className="text-3xl mb-8">
          A free service that will send you a text message reminder the day before your court hearing.
        </h2>
        <h3 className="text-2xl font-bold">
          How it works:
        </h3>
        <div id="howItWorks" className="mb-8">
          <p>
            Just text your case or ticket number to:
          </p>
          <div id="phoneNumber" className="block p-4 text-2xl font-bold">
            { process.env.NEXT_PUBLIC_PHONE_NUMBER }
          </div>
          <p>
            We will attempt to send you a reminder the evening before your court hearing.
          </p>
          <p>
            Case numbers are 14 characters long like: 123-45-678 or 123-CR-45.
            Ticket numbers can be 5 to 9 characters long.
          </p>

          <div id="testcase" className="card m-2 border border-gray-400 rounded-lg">
            <div className="m-3">
              <h2 className="text-lg mb-2">
                Curious how it works? Try it out in demo mode:
              </h2>
              <p className="font-light font-mono text-sm text-gray-700 hover:text-gray-900 transition-all duration-200">
                Text: testcase<br />
                To: { process.env.NEXT_PUBLIC_PHONE_NUMBER }
              </p>
            </div>
          </div>
        </div>
        <h4 className="text-2xl font-bold mb-4">
          Frequently Asked Questions
        </h4>

        <dl>
          <dt className="font-bold">
            How do I turn off all notifications?
          </dt>
          <dd className="mb-4">
            Reply to the message with "stop" and we will stop sending you notifications.
          </dd>

          <dt className="font-bold">
            How do I turn off notifications for an individual case or ticket?
          </dt>
          <dd className="mb-4">
            Text in the case or ticket number you are currently following to 1-907-312-2700 and the service will reply with the option to reply "DELETE" to stop notifications for that case or ticket.
          </dd>

          <dt className="font-bold">
            Do I still need to verify my court date?
          </dt>
          <dd className="mb-4">
            Yes! Court dates change frequently, so you should always verify the date and time of your hearing by visiting the <a className="underline text-blue-500" href="https://www.vermontjudiciary.org/court-hearings">Vermont Judiciary</a>.
          </dd>

          <dt className="font-bold">
            Who maintains CourtBotVT?
          </dt>
          <dd className="mb-4">
            CourtBotVT is maintained by volunteers at Code for BTV, a brigade of Code for America. If you would like to be involved with this or similar projects, please visit: <a className="underline text-blue-500" href="http://codeforbtv.org">Code for BTV</a>.
          </dd>
        </dl>
      </div>
      <div className="w-full md:w-1/3">
        <img src="/imgs/phone.png" className="p-8 mx-auto" />
        <img src="/imgs/c4btv-192x192.png" className="p-8 mx-auto" />
      </div>
    </div>
  )
}
