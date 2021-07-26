import Head from 'next/head'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Vermont CourtBot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl font-bold text-center p-4">
        Vermont CourtBot
      </h1>
      <h2>A free service that will send you a text message reminder the day before your court hearing.</h2>
      <h3>How it works:</h3>
      <div id="howItWorks">
          <p>
              Just text your case or ticket number to:
              <br />
              <span id="phoneNumber">{ process.env.NEXT_PUBLIC_PHONE_NUMBER }</span> <br />
              We will attempt to send you a reminder the evening before your court hearing. Case numbers are 14 characters long like: 1KE-19-01234MO. Ticket numbers can be 8 to 17 characters long, for example: KETEEP000123456.    
          </p>
          <div id="testcase">
              <h5>Curious how it works? Try it out in demo mode:</h5>
              <p>Text: <b>testcase</b><br /> To: { process.env.NEXT_PUBLIC_PHONE_NUMBER }</p>
          </div>
      </div>
      
      <h4>Frequently asked questions</h4>
      <p className="faq">
          <b>How do I turn off all notifications?</b><br />
          Reply to the message with "stop" and we will stop sending you notifications.
      </p>
      <p className="faq">
          <b>How do I turn off notifications for an individual case or ticket?</b><br />
          Text in the case or ticket number you are currently following to 1-907-312-2700 and the service will reply with the option to reply "DELETE" to stop notifications for that case or ticket.
      </p>
      <p className="faq">
              <b>Do I still need to verify my court date?</b><br />
              Yes! Court dates change frequently, so you should always verify the date and time of your hearing by visiting the <a href="https://records.courts.alaska.gov">Alaska State Court System</a>.
      </p>
      <p className="faq">
              <b>Who maintains Alaska CourtBot</b><br />
              Alaska CourtBot is maintained by volunteers at Code for Anchorage, a brigade of Code for America. If you would like to be involved with this or similar projects, please visit: <a href="http://codeforanchorage.org">Code for Anchorage</a>.
      </p>
    </div>
  )
}
