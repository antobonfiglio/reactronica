import React from 'react';
import NextApp from 'next/app';
import Head from 'next/head';
import { MDXProvider } from '@mdx-js/react';

import DocApp from '../components/DocApp';
import DAWApp from '../components/DAWApp';
import CodeBlock from '../components/CodeBlock';

// import { withApollo } from '../lib/apollo';

class MyApp extends NextApp {
  render() {
    const { Component, pageProps, router } = this.props;

    let AppComponent;

    if (router.route === '/') {
      AppComponent = DocApp;
    } else {
      AppComponent = ({ children }) => {
        return children;
      };
    }

    const components = {
      pre: (props) => <div {...props} />,
      // code: (props) => <pre style={{ color: 'tomato' }} {...props} />,
      code: CodeBlock,
    };

    return (
      <MDXProvider components={components}>
        <Head>
          <link
            href="https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css"
            rel="stylesheet"
          />
        </Head>

        <AppComponent>
          <Component {...pageProps} />
        </AppComponent>
      </MDXProvider>
    );
  }
}

export default MyApp;
