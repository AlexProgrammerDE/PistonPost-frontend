import "styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { NextComponentType } from "next";
import Auth from "components/Auth";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import UserDataProvider from "components/UserDataProvider";
import Head from "next/head";
import axios from "lib/axios";
import { SWRConfig } from "swr";

if (!global._hasSetTime) {
  TimeAgo.addDefaultLocale(en);
  global._hasSetTime = true;
}

type CustomAppProps = AppProps & {
  Component: NextComponentType & { auth?: boolean }; // add auth type
};

// noinspection JSUnusedGlobalSymbols
export default function App({
                              Component,
                              pageProps: { session, ...pageProps }
                            }: CustomAppProps) {
  // noinspection HtmlRequiredTitleElement
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SWRConfig
        value={{ fetcher: (url) => axios.get(url).then((res) => res.data) }}
      >
        <SessionProvider session={session}>
          <UserDataProvider>
            {Component.auth ? (
              <Auth>
                <Component {...pageProps} />
              </Auth>
            ) : (
              <Component {...pageProps} />
            )}
          </UserDataProvider>
        </SessionProvider>
      </SWRConfig>
    </>
  );
}
