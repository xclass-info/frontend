import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className='py-24 px-6 lg:px-16 bg-white'>
      <div className='max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl p-16 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2' />
        <div className='relative z-10'>
          <h2 className="font-['Fredoka_One'] text-4xl lg:text-5xl text-white mb-4">
            Ready to start learning? 🚀
          </h2>
          <p className='text-purple-100 font-semibold text-lg mb-8 max-w-xl mx-auto'>
            Join 10,000+ students already learning on xclass. First session is
            free!
          </p>
          <div className='flex gap-4 justify-center flex-wrap'>
            <Link
              to='/register'
              className='bg-white text-purple-600 font-extrabold text-lg px-8 py-4 rounded-full shadow-xl hover:-translate-y-1 transition-all'
            >
              Get started free →
            </Link>
            <Link
              to='/tutors'
              className='border-2 border-white text-white font-extrabold text-lg px-8 py-4 rounded-full hover:bg-white/10 transition-all'
            >
              Browse tutors
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
