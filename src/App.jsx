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
import ShowcaseListing from "./components/ShowcaseListing";
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
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    const observeReveals = (root) => {
      root.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    };
    observeReveals(document);

    // Sections like Tutors/ResearchSection render their real .reveal cards
    // only after their own Firestore fetch resolves, which happens after
    // this initial scan - watch for those being added to the page too.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const { addedNodes } of mutations) {
        addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList?.contains("reveal")) observer.observe(node);
          observeReveals(node);
        });
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
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
        <Route path='/showcase' element={<ShowcaseListing />} />
        <Route path='/internship' element={<InternshipListing />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/contact' element={<ContactUs />} />
        <Route path='/gallery' element={<Gallery />} />
        <Route path='/programs/:programId' element={<ProgramDetail />} />
      </Routes>
    </HashRouter>
  );
}
