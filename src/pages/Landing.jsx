import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Subjects from "../components/Subjects";
import FeaturedTutors from "../components/FeaturedTutors";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import ClassPosts from "../components/ClassPosts";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className='overflow-x-hidden'>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Subjects />
      <FeaturedTutors />
      <Testimonials />
      <Pricing />
      <ClassPosts />
      <CTA />
      <Footer />
    </div>
  );
}
