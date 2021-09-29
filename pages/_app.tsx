import { AppProps } from 'next/app'
import Head from 'next/head';
import '../css/styles.css';

function App({ Component, pageProps }:AppProps) {
    return (
        <>
            {/* Add the favicon */}
            <Head>
                <link rel="icon" href="/imgs/courtbot-btv-32x32.png" sizes="32x32" />
                <link rel="icon" href="/imgs/courtbot-btv-192x192.png" sizes="192x192" />

            </Head>

            <Component {...pageProps} />
        </>
    );
}

export default App