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
import TeacherProfile from "./components/TeacherProfile";
import ResearchListing from "./components/ResearchListing";
import ResearchSection from "./components/ResearchSection";

import { seedResearch } from "./components/seedResearch";
import InternshipListing from "./components/InternshipListing";
import InternshipSection from "./components/InternshipSection";

import { seedInternships } from "./components/seedInternships";

import { seedTeachers } from "./components/seedTeachers";
import ContactUs from "./components/ContactUs";

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
      <ResearchSection />
      <InternshipSection />
      <Tutors />
      <Testimonials />
      <Footer />

      <button
        onClick={seedResearch}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 999,
          padding: "10px 20px",
          background: "#4a90e2",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Seed Research
      </button>

      <button
        onClick={seedInternships}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 999,
          padding: "10px 20px",
          background: "#27ae60",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Seed Internships
      </button>

      <button
        onClick={seedTeachers}
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          zIndex: 999,
          padding: "10px 20px",
          background: "#9b6bff",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Seed Teachers
      </button>
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
        <Route path='/teacher/register' element={<TeacherRegister />} />
        <Route path='/teacher/login' element={<TeacherLogin />} />
        <Route path='/teacher/dashboard' element={<TeacherDashboard />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/teacher/:teacherId' element={<TeacherProfile />} />
        <Route path='/research' element={<ResearchListing />} />
        <Route path='/internship' element={<InternshipListing />} />;
        <Route path='/contact' element={<ContactUs />} />
      </Routes>
    </HashRouter>
  );
}
