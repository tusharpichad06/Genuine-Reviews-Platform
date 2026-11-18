function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-10 sm:py-20 lg:px-16">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}
          <div className="mb-5 inline-flex max-w-full items-center rounded-full border border-[#bdeee8] bg-[#dffaf6] px-3 py-1.5 text-xs font-medium text-[#087f73] shadow-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
            <span className="mr-1.5 text-[#0aa58f] sm:mr-2">✦</span>
            Honest opinions. Real experiences.
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#102c59] sm:text-5xl lg:text-7xl">
            Discover Genuine Reviews
            <span className="block bg-gradient-to-r from-[#1687f8] to-[#2774e8] bg-clip-text text-transparent">
              Before You Decide
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl px-2 text-sm leading-6 text-[#3970ad] sm:mt-6 sm:px-0 sm:text-lg sm:leading-7">
            Find honest reviews from real people about products,
            services, places, and everything that matters to you.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;