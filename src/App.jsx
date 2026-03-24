import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Courses from "./components/Courses";
import PrivateLessons from "./components/PrivateLessons";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import EnrollPage from "./components/EnrollPage";
import LoadingScreen from "./components/LoadingScreen";

import TeacherRegister from "./components/TeacherRegister";
import TeacherLogin from "./components/TeacherLogin";
import TeacherDashboard from "./components/TeacherDashboard";
import CreateClass from "./components/CreateClass";
import ClassListing from "./components/ClassListing";
import Classroom from "./components/Classroom";

function HomePage() {
  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) =>
  //       entries.forEach((e) => {
  //         if (e.isIntersecting) e.target.classList.add("visible");
  //       }),
  //     { threshold: 0.1 },
  //   );
  //   const els = document.querySelectorAll(".reveal");
  //   els.forEach((el) => observer.observe(el));
  //   return () => observer.disconnect();
  // }, []);

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
      <Courses />
      <Hero />
      <PrivateLessons />
      <About />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/teacher/register' element={<TeacherRegister />} />
        <Route path='/teacher/login' element={<TeacherLogin />} />
        <Route path='/teacher/dashboard' element={<TeacherDashboard />} />;
        <Route path='/' element={<HomePage />} />
        <Route path='/enroll/:courseTitle' element={<EnrollPage />} />
        <Route path='/teacher/create-class' element={<CreateClass />} />
        <Route path='/classes' element={<ClassListing />} />
        <Route path='/classroom/:classId' element={<Classroom />} />
      </Routes>
    </BrowserRouter>
  );
}
