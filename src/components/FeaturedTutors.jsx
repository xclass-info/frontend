const TUTORS = [
  {
    name: "Sarah Johnson",
    subject: "Math & Physics",
    rating: 5.0,
    reviews: 128,
    price: 45,
    emoji: "👩‍🏫",
    tag: "Top Rated",
  },
  {
    name: "James Lee",
    subject: "Python & AI",
    rating: 4.9,
    reviews: 96,
    price: 55,
    emoji: "👨‍💻",
    tag: "Popular",
  },
  {
    name: "Maria Garcia",
    subject: "English & Writing",
    rating: 5.0,
    reviews: 214,
    price: 40,
    emoji: "👩‍🎓",
    tag: "Best Value",
  },
  {
    name: "David Chen",
    subject: "Business & Finance",
    rating: 4.8,
    reviews: 73,
    price: 60,
    emoji: "👨‍💼",
    tag: "Expert",
  },
];

export default function FeaturedTutors() {
  return (
    <section id='tutors' className='py-24 px-6 lg:px-16 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <div className='inline-block bg-orange-100 text-orange-600 font-bold text-sm px-4 py-2 rounded-full mb-4'>
            Featured Tutors
          </div>
          <h2 className="font-['Fredoka_One'] text-4xl lg:text-5xl text-gray-900 mb-4">
            Meet our top tutors 🌟
          </h2>
          <p className='text-gray-400 font-semibold text-lg max-w-xl mx-auto'>
            Handpicked experts with proven track records and glowing reviews.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {TUTORS.map((t) => (
            <div
              key={t.name}
              className='bg-white border-2 border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:-translate-y-2 transition-all'
            >
              <div className='relative mb-4'>
                <div className='w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-4xl mx-auto'>
                  {t.emoji}
                </div>
                <div className='absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
                  {t.tag}
                </div>
              </div>
              <h3 className="font-['Fredoka_One'] text-lg text-gray-800 text-center mb-1">
                {t.name}
              </h3>
              <p className='text-purple-500 text-sm font-bold text-center mb-3'>
                {t.subject}
              </p>
              <div className='flex justify-center gap-1 mb-3'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className='text-yellow-400 text-sm'>
                    ★
                  </span>
                ))}
                <span className='text-gray-400 text-xs ml-1 font-bold'>
                  {t.rating} ({t.reviews})
                </span>
              </div>
              <div className='flex items-center justify-between pt-3 border-t-2 border-dashed border-gray-100'>
                <span className="font-['Fredoka_One'] text-purple-600 text-lg">
                  ${t.price}
                  <span className='text-gray-400 text-sm'>/hr</span>
                </span>
                <button className='bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors'>
                  Book →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
