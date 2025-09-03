"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import styles from "./loading.module.scss";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const rawCode = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preload" href="/_next/static/media/edb04066f2cf7d2a-s.p.woff" as="font" crossorigin="" type="font/woff" />
    <link rel="preload" as="image" href="/img/svg/logoFlecha.svg" />
    <link rel="preload" as="image" href="/img/png/imageImpulsoWeb2.png" />
    <link rel="preload" as="image" href="/avatar1.jpg" />
    <link rel="preload" as="image" href="/avatar2.jpg" />
    <link rel="preload" as="image" href="/img/png/FOTO.png" />
    <link rel="stylesheet" href="/_next/static/css/42181f44d2c40421.css" data-precedence="next" />
    <link rel="stylesheet" href="/_next/static/css/281b71616f60cace.css" data-precedence="next" />
    <link rel="stylesheet" href="/_next/static/css/baf5119130251d1c.css" data-precedence="next" />
    <link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/webpack-2df505a98bdb1695.js" />
    <script src="/_next/static/chunks/fd9d1056-0ca7524c1b5161c7.js" async></script>
    <script src="/_next/static/chunks/117-ed15a8468ab6960f.js" async></script>
    <script src="/_next/static/chunks/main-app-f1a455f1c1f7388d.js" async></script>
    <script src="/_next/static/chunks/788-b5eee62f50f30dab.js" async></script>
    <script src="/_next/static/chunks/249-fa3725a2f05cb6bf.js" async></script>
    <script src="/_next/static/chunks/972-f946c95c84358a1f.js" async></script>
    <script src="/_next/static/chunks/513-2f016c77807c4e43.js" async></script>
    <script src="/_next/static/chunks/78-cbb0a5c3ed1a6c69.js" async></script>
    <script src="/_next/static/chunks/602-09aefe15ada6624b.js" async></script>
    <script src="/_next/static/chunks/app/page-1874be5124857898.js" async></script>
    <script src="/_next/static/chunks/640-22bc1813608b4602.js" async></script>
    <script src="/_next/static/chunks/app/layout-f7aaacb725e07dba.js" async></script>
    <script src="/_next/static/chunks/app/not-found-049df2da2dbb7d8f.js" async></script>
    <script src="/_next/static/chunks/app/loading-31a2f57f0cc2257a.js" async></script>
    <link rel="preload" href="https://checkout.culqi.com/js/v4" as="script" />
    <script>
      (self.__next_s = self.__next_s || []).push(["https://checkout.culqi.com/js/v4", {}])
    </script>
    <script src="/_next/static/chunks/polyfills-42372ed130431b0a.js" noModule></script>
    <title>ImpulsoWeb.pe</title>
    <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="250x250" />
    <meta name="next-size-adjust" />
  </head>
  <body>
    <style data-emotion="css-global 3t5apm">
      html {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        box-sizing: border-box;
        -webkit-text-size-adjust: 100%;
      }
      *, *::before, *::after {
        box-sizing: inherit;
      }
      strong, b {
        font-weight: 700;
      }
      body {
        margin: 0;
        color: rgba(0, 0, 0, 0.87);
        font-family: '__neueHaasUnicaProRegular_130d12', '__neueHaasUnicaProRegular_Fallback_130d12';
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.5;
        background-color: #fff;
      }
      @media print {
        body {
          background-color: #fff;
        }
      }
      body::backdrop {
        background-color: #fff;
      }
    </style>

    <!--$-->
    <div class="pageContainer">
      <style data-emotion="css lwfyee">
        .css-lwfyee {
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
          flex-shrink: 0;
          position: sticky;
          z-index: 1100;
          top: 0;
          left: auto;
          right: 0;
          background-color: #0b2343;
          color: #fff;
          background-color: #0d1a28;
        }
      </style>
    </div>
  </body>
</html>
`;

export default function LoadingComponent() {
  const [displayedCode, setDisplayedCode] = useState("");
  const [index, setIndex] = useState(0);
  const [highlightedCode, setHighlightedCode] = useState("");
  const codeRef = useRef<HTMLPreElement>(null);

  // Prepara el código resaltado al iniciar
  useEffect(() => {
    const highlighted = hljs.highlight(rawCode, { language: "html" }).value;
    setHighlightedCode(highlighted);
  }, []);

  // Tipea carácter a carácter el código resaltado (HTML)
  useEffect(() => {
    if (highlightedCode && index < highlightedCode.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode((prev) => prev + highlightedCode[index]);
        setIndex(index + 1);
      }, 0.8);
      return () => clearTimeout(timeout);
    }
  }, [index, highlightedCode]);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [displayedCode]);

  return (
    <Box
      className="loader"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#ffffff",
        width: "100vw",
        height: "100vh",
        zIndex: "5000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className={styles.container}>
        <div className={styles.laptop}>
          <div className={styles.screen}>
            <pre
              ref={codeRef}
              className={`${styles.code} language-html`}
              dangerouslySetInnerHTML={{
                __html: displayedCode + `<span class="${styles.cursor}">█</span>`,
              }}
            />
          </div>
          {/* Logo */}
          <Box display="flex" alignItems="center" justifyContent="center" mt={3}>
            <img src="/img/svg/logoFlecha.svg" alt="ImpulsoWeb logo" width={64} height={64} />
            <Typography
              variant="h4"
              color="#0d1a28"
              component="div"
              sx={{ ml: 2, fontWeight: 700 }}
            >
              IMPULSO <span style={{ color: "#32bb81" }}>WEB</span>
            </Typography>
          </Box>
        </div>
      </div>
    </Box>
  );
}
