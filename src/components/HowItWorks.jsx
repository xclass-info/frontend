const STEPS = [
  {
    icon: "🔍",
    title: "Find a tutor",
    desc: "Browse hundreds of expert tutors by subject, rating, price, and availability.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: "📅",
    title: "Book a session",
    desc: "Pick a time that works for you and book instantly — no back and forth.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: "🎥",
    title: "Learn live",
    desc: "Join your session via our built-in video classroom with chat and whiteboard.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: "⭐",
    title: "Rate & grow",
    desc: "Leave a review and track your progress over time.",
    color: "bg-green-100 text-green-600",
  },
];

export default function HowItWorks() {
  return (
    <section id='how' className='py-24 px-6 lg:px-16 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <div className='inline-block bg-purple-100 text-purple-600 font-bold text-sm px-4 py-2 rounded-full mb-4'>
            How it works
          </div>
          <h2 className="font-['Fredoka_One'] text-4xl lg:text-5xl text-gray-900 mb-4">
            Start learning in minutes 🎯
          </h2>
          <p className='text-gray-400 font-semibold text-lg max-w-xl mx-auto'>
            From finding a tutor to your first session — it takes less than 5
            minutes.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {STEPS.map((step, i) => (
            <div key={i} className='relative'>
              {i < STEPS.length - 1 && (
                <div className='hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 z-0' />
              )}
              <div className='relative z-10 bg-white border-2 border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all'>
                <div
                  className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-3xl mb-4`}
                >
                  {step.icon}
                </div>
                <div className="font-['Fredoka_One'] text-gray-400 text-4xl mb-2">
                  0{i + 1}
                </div>
                <h3 className="font-['Fredoka_One'] text-xl text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className='text-gray-400 font-semibold text-sm leading-relaxed'>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
