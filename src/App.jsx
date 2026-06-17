import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Subjects from "./components/Subjects";
import Tutors from "./components/Tutors";
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
import { HashRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./components/AdminDashboard";

import { useNavigate } from "react-router-dom";

// Redirect component
function MeetingRedirect() {
  useEffect(() => {
    window.location.href = "https://xclass-meeting.daily.co/happyresearch";
  }, []);
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      Redirecting to meeting...
    </div>
  );
}

// Add this route in App.jsx:

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
      {/* <HowItWorks /> */}
      {/* <Subjects /> */}
      <Tutors />
      <ClassPosts />
      <Testimonials />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/tutors' element={<Tutors />} />
        <Route path='/classes' element={<ClassListing />} />
        <Route path='/classroom/:classId' element={<Classroom />} />
        <Route path='/teacher/register' element={<TeacherRegister />} />
        <Route path='/teacher/login' element={<TeacherLogin />} />
        <Route path='/teacher/dashboard' element={<TeacherDashboard />} />
        <Route path='/teacher/create-class' element={<CreateClass />} />
        <Route path='/adpost' element={<AdPostForm />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/happyresearch' element={<MeetingRedirect />} />
      </Routes>
    </HashRouter>
  );
}
