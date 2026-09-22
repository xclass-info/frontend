import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Tutors from "./components/Tutors";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import TeacherRegister from "./components/TeacherRegister";
import TeacherLogin from "./components/TeacherLogin";
import TeacherDashboard from "./components/TeacherDashboard";
import CreateClass from "./components/CreateClass";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./components/AdminDashboard";
import TeacherProfile from "./components/TeacherProfile";
import ResearchListing from "./components/ResearchListing";
import ResearchDetail from "./components/ResearchDetail";
import ProjectListing from "./components/ProjectListing";
import ProjectDetail from "./components/ProjectDetail";
import CourseListing from "./components/CourseListing";
import CourseDetail from "./components/CourseDetail";
import StudentLogin from "./components/StudentLogin";
import StudentRegister from "./components/StudentRegister";
import StudentDashboard from "./components/StudentDashboard";
import ResearchSection from "./components/ResearchSection";

import InternshipListing from "./components/InternshipListing";

import ContactUs from "./components/ContactUs";
import AboutUs from "./components/AboutUs";
import Gallery from "./components/Gallery";

import ResearchPrograms from "./components/ResearchPrograms";
import ProgramDetail from "./components/ProgramDetail";

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
      <Navbar />
      <Hero />
      <HowItWorks />
      <ResearchPrograms />
      <ResearchSection />
      <Tutors />
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
        <Route path='/tutors' element={<Tutors standalone={true} />} />
        <Route path='/student/login' element={<StudentLogin />} />
        <Route path='/student/register' element={<StudentRegister />} />
        <Route path='/student/dashboard' element={<StudentDashboard />} />
        <Route
          path='/student/registrations'
          element={<Navigate to='/student/dashboard' replace />}
        />
        <Route path='/teacher/register' element={<TeacherRegister />} />
        <Route path='/teacher/login' element={<TeacherLogin />} />
        <Route path='/teacher/dashboard' element={<TeacherDashboard />} />
        <Route path='/teacher/create-class' element={<CreateClass />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/teacher/:teacherId' element={<TeacherProfile />} />
        <Route path='/research' element={<ResearchListing />} />
        <Route path='/research/:researchId' element={<ResearchDetail />} />
        <Route path='/projects' element={<ProjectListing />} />
        <Route path='/projects/:projectId' element={<ProjectDetail />} />
        <Route path='/courses' element={<CourseListing />} />
        <Route path='/courses/:courseId' element={<CourseDetail />} />
        <Route path='/internship' element={<InternshipListing />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/contact' element={<ContactUs />} />
        <Route path='/gallery' element={<Gallery />} />
        <Route path='/programs/:programId' element={<ProgramDetail />} />
      </Routes>
    </HashRouter>
  );
}
