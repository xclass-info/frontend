const SUBJECTS = [
  {
    icon: "🧮",
    name: "Mathematics",
    tutors: 48,
    color: "from-purple-400 to-purple-600",
  },
  {
    icon: "🔬",
    name: "Science",
    tutors: 36,
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: "💻",
    name: "Programming",
    tutors: 62,
    color: "from-pink-400 to-pink-600",
  },
  {
    icon: "🤖",
    name: "AI & ML",
    tutors: 24,
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: "📝",
    name: "English",
    tutors: 55,
    color: "from-green-400 to-green-600",
  },
  {
    icon: "🎨",
    name: "Design",
    tutors: 31,
    color: "from-yellow-400 to-yellow-600",
  },
  {
    icon: "🌍",
    name: "Languages",
    tutors: 44,
    color: "from-red-400 to-red-600",
  },
  {
    icon: "📊",
    name: "Business",
    tutors: 28,
    color: "from-indigo-400 to-indigo-600",
  },
];

export default function Subjects() {
  return (
    <section
      id='subjects'
      className='py-24 px-6 lg:px-16 bg-gradient-to-br from-purple-50 to-pink-50'
    >
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <div className='inline-block bg-pink-100 text-pink-600 font-bold text-sm px-4 py-2 rounded-full mb-4'>
            Subjects
          </div>
          <h2 className="font-['Fredoka_One'] text-4xl lg:text-5xl text-gray-900 mb-4">
            Learn anything 📚
          </h2>
          <p className='text-gray-400 font-semibold text-lg max-w-xl mx-auto'>
            From math to machine learning — we have expert tutors for every
            subject.
          </p>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {SUBJECTS.map((s) => (
            <div
              key={s.name}
              className='bg-white rounded-3xl p-6 border-2 border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group'
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
              >
                {s.icon}
              </div>
              <h3 className="font-['Fredoka_One'] text-lg text-gray-800 mb-1">
                {s.name}
              </h3>
              <p className='text-gray-400 text-sm font-bold'>
                {s.tutors} tutors
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
