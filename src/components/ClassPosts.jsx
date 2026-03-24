const POSTS = [
  {
    title: "Python for Beginners",
    tutor: "James Lee",
    date: "Mon, Mar 25",
    time: "4:00 PM",
    seats: 3,
    price: 20,
    emoji: "🐍",
    tag: "Live",
  },
  {
    title: "SAT Math Prep",
    tutor: "Sarah Johnson",
    date: "Tue, Mar 26",
    time: "6:00 PM",
    seats: 5,
    price: 25,
    emoji: "📐",
    tag: "Upcoming",
  },
  {
    title: "AI & ChatGPT Basics",
    tutor: "James Lee",
    date: "Wed, Mar 27",
    time: "5:00 PM",
    seats: 8,
    price: 30,
    emoji: "🤖",
    tag: "Upcoming",
  },
];

export default function ClassPosts() {
  return (
    <section className='py-24 px-6 lg:px-16 bg-gradient-to-br from-purple-50 to-pink-50'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <div className='inline-block bg-purple-100 text-purple-600 font-bold text-sm px-4 py-2 rounded-full mb-4'>
            Upcoming Classes
          </div>
          <h2 className="font-['Fredoka_One'] text-4xl lg:text-5xl text-gray-900 mb-4">
            Join a live class today 🎥
          </h2>
          <p className='text-gray-400 font-semibold text-lg max-w-xl mx-auto'>
            Book a seat in one of our upcoming group sessions.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {POSTS.map((p) => (
            <div
              key={p.title}
              className='bg-white border-2 border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all'
            >
              <div className='flex items-center justify-between mb-4'>
                <span className='text-4xl'>{p.emoji}</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${p.tag === "Live" ? "bg-green-100 text-green-600 animate-pulse" : "bg-purple-100 text-purple-600"}`}
                >
                  {p.tag === "Live" ? "🔴 " : ""}
                  {p.tag}
                </span>
              </div>
              <h3 className="font-['Fredoka_One'] text-xl text-gray-800 mb-1">
                {p.title}
              </h3>
              <p className='text-purple-500 text-sm font-bold mb-3'>
                by {p.tutor}
              </p>
              <div className='space-y-1 text-sm text-gray-400 font-bold mb-4'>
                <div>
                  📅 {p.date} at {p.time}
                </div>
                <div>👥 {p.seats} seats left</div>
              </div>
              <div className='flex items-center justify-between pt-3 border-t-2 border-dashed border-gray-100'>
                <span className="font-['Fredoka_One'] text-purple-600 text-xl">
                  ${p.price}
                </span>
                <button className='bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity'>
                  Book seat →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
