import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Subjects from "./components/Subjects";
import FeaturedTutors from "./components/FeaturedTutors";
import Testimonials from "./components/Testimonials";
import ClassPosts from "./components/ClassPosts";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import TeacherRegister from "./components/TeacherRegister";
import TeacherLogin from "./components/TeacherLogin";
import TeacherDashboard from "./components/TeacherDashboard";
import CreateClass from "./components/CreateClass";
import ClassListing from "./components/ClassListing";
import Classroom from "./components/Classroom";
import AdPostForm from "./components/AdPostForm";
import AdPost from "./components/AdPost";

function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <LoadingScreen />
      <Navbar />
      <AdPost />
      <Hero />
      <HowItWorks />
      <Subjects />
      <FeaturedTutors />
      <Testimonials />
      <ClassPosts />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/classes' element={<ClassListing />} />
        <Route path='/classroom/:classId' element={<Classroom />} />
        <Route path='/teacher/register' element={<TeacherRegister />} />
        <Route path='/teacher/login' element={<TeacherLogin />} />
        <Route path='/teacher/dashboard' element={<TeacherDashboard />} />
        <Route path='/teacher/create-class' element={<CreateClass />} />
        <Route path='/adpost' element={<AdPostForm />} />
      </Routes>
    </BrowserRouter>
  );
}
