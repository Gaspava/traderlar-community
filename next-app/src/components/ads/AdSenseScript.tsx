'use client';

import Script from 'next/script';

interface AdSenseScriptProps {
  publisherId: string;
}

export default function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  return (
    <>
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      />
      <Script
        id="adsbygoogle-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${publisherId}",
              enable_page_level_ads: true
            });
          `
        }}
      />
    </>
  );
}