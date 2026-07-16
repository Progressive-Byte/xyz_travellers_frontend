export function ExampleDomainClone() {
  return (
    <section className="grid min-h-screen place-items-center bg-[#f7f7f7] px-6 text-[#333333]">
      <div className="w-full max-w-[40rem]">
        <h1 className="text-[2rem] font-bold tracking-[-0.02em]">
          Example Domain
        </h1>
        <p className="mt-4 max-w-[36rem] text-base leading-7">
          This recreated layout mirrors the simple informational structure of the
          public example.com page using new React code inside this local app.
        </p>
        <a
          className="mt-4 inline-block text-sm text-[#3b5fd9] underline"
          href="https://www.iana.org/help/example-domains"
          target="_blank"
          rel="noreferrer"
        >
          Learn more
        </a>
      </div>
    </section>
  );
}
