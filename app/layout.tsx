const Layout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <link rel="icon" href="/favicon.ico" />
      <meta name="description" content="GPT-3 powered cyber security advisor" />
    </head>
    <body>{children}</body>
  </html>
);

export default Layout;
