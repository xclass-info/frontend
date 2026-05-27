import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const teachers = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@happyresearch.org",
    bio: "I am a passionate AI researcher with over 10 years of experience in machine learning and computer vision. I love mentoring students and helping them discover the joy of research.",
    degree: "Doctor of Philosophy (PhD)",
    university: "MIT",
    expertise: "Machine Learning & Computer Vision",
    researchArea: "Deep Learning for Medical Imaging",
    yearsOfExperience: "10",
    languages: "English, French",
    gender: "Female",
    website: "https://linkedin.com/in/sarahjohnson",
    rating: 4.9,
    projects: [
      {
        id: "p1",
        title: "AI Skin Cancer Detector",
        description:
          "Build a CNN model that classifies skin lesion images as benign or malignant using the HAM10000 dataset.",
      },
      {
        id: "p2",
        title: "Real-Time Sign Language Translator",
        description:
          "Use computer vision and LSTM networks to translate American Sign Language gestures into text in real time.",
      },
      {
        id: "p3",
        title: "Chest X-Ray Pneumonia Detection",
        description:
          "Train a deep learning model to detect pneumonia from chest X-ray images with explainability features.",
      },
    ],
  },
  {
    name: "Dr. Michael Chen",
    email: "michael.chen@happyresearch.org",
    bio: "Quantum computing researcher and educator. I believe that every student has the potential to contribute to cutting-edge research. My goal is to make complex topics accessible and exciting.",
    degree: "Doctor of Philosophy (PhD)",
    university: "Caltech",
    expertise: "Quantum Computing",
    researchArea: "Quantum Algorithms & Cryptography",
    yearsOfExperience: "8",
    languages: "English, Mandarin",
    gender: "Male",
    website: "https://linkedin.com/in/michaelchen",
    rating: 4.8,
    projects: [
      {
        id: "p1",
        title: "Quantum Key Distribution Simulator",
        description:
          "Simulate BB84 quantum key distribution protocol and analyze its resistance to eavesdropping attacks.",
      },
      {
        id: "p2",
        title: "Grover's Algorithm Implementation",
        description:
          "Implement Grover's search algorithm on IBM Quantum and benchmark it against classical search.",
      },
    ],
  },
  {
    name: "Dr. Aisha Patel",
    email: "aisha.patel@happyresearch.org",
    bio: "Biomedical engineer passionate about developing affordable healthcare solutions for underserved communities. I have worked on projects spanning prosthetics, diagnostics and drug delivery.",
    degree: "Doctor of Philosophy (PhD)",
    university: "Johns Hopkins University",
    expertise: "Biomedical Engineering",
    researchArea: "Low-Cost Medical Devices",
    yearsOfExperience: "7",
    languages: "English, Hindi, Gujarati",
    gender: "Female",
    website: "https://linkedin.com/in/aishapatel",
    rating: 4.9,
    projects: [
      {
        id: "p1",
        title: "Low-Cost Pulse Oximeter",
        description:
          "Design a $5 pulse oximeter using Arduino and infrared sensors for use in rural clinics.",
      },
      {
        id: "p2",
        title: "3D Printed Prosthetic Hand",
        description:
          "Design and fabricate a functional prosthetic hand using 3D printing and servo motors controlled by EMG signals.",
      },
      {
        id: "p3",
        title: "Smart Pill Dispenser",
        description:
          "Build an IoT-connected pill dispenser that reminds patients and tracks medication adherence.",
      },
    ],
  },
  {
    name: "Prof. James Williams",
    email: "james.williams@happyresearch.org",
    bio: "Environmental scientist with a focus on climate change mitigation. I have led field research expeditions across 5 continents and published over 40 peer-reviewed papers.",
    degree: "Doctor of Philosophy (PhD)",
    university: "Stanford University",
    expertise: "Environmental Science & Climate Change",
    researchArea: "Carbon Sequestration & Renewable Energy",
    yearsOfExperience: "15",
    languages: "English, Spanish",
    gender: "Male",
    website: "https://linkedin.com/in/jameswilliams",
    rating: 4.7,
    projects: [
      {
        id: "p1",
        title: "Urban Heat Island Mapping",
        description:
          "Use satellite thermal data to map urban heat islands in major cities and propose green infrastructure solutions.",
      },
      {
        id: "p2",
        title: "Carbon Footprint Calculator App",
        description:
          "Build a web app that calculates personal carbon footprint and suggests personalized reduction strategies.",
      },
      {
        id: "p3",
        title: "Microplastics in Local Waterways",
        description:
          "Sample and analyze microplastic concentrations in local rivers and correlate with urbanization levels.",
      },
    ],
  },
  {
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@happyresearch.org",
    bio: "Neuroscientist studying the neural basis of learning and memory. I am dedicated to translating basic science discoveries into better educational tools and treatments for cognitive disorders.",
    degree: "Doctor of Philosophy (PhD)",
    university: "Harvard University",
    expertise: "Neuroscience & Cognitive Science",
    researchArea: "Neural Plasticity & Learning",
    yearsOfExperience: "9",
    languages: "English, Spanish, Portuguese",
    gender: "Female",
    website: "https://linkedin.com/in/emilyrodriguez",
    rating: 4.8,
    projects: [
      {
        id: "p1",
        title: "Screen Time & Attention Study",
        description:
          "Design an online experiment to measure how daily screen time affects sustained attention in teenagers.",
      },
      {
        id: "p2",
        title: "Music & Memory Enhancement",
        description:
          "Study whether background music improves working memory performance across different age groups.",
      },
    ],
  },
  {
    name: "Dr. Ahmed Hassan",
    email: "ahmed.hassan@happyresearch.org",
    bio: "Robotics engineer and AI enthusiast. I have designed autonomous systems for manufacturing, agriculture and disaster response. Teaching is my way of giving back to the next generation.",
    degree: "Doctor of Philosophy (PhD)",
    university: "Carnegie Mellon University",
    expertise: "Robotics & Autonomous Systems",
    researchArea: "Human-Robot Interaction",
    yearsOfExperience: "11",
    languages: "English, Arabic, French",
    gender: "Male",
    website: "https://linkedin.com/in/ahmedhassan",
    rating: 4.9,
    projects: [
      {
        id: "p1",
        title: "Maze-Solving Robot",
        description:
          "Build a robot that uses sensor fusion and pathfinding algorithms to autonomously navigate a maze.",
      },
      {
        id: "p2",
        title: "Gesture-Controlled Robotic Arm",
        description:
          "Develop a robotic arm controlled by hand gestures using a camera and MediaPipe pose estimation.",
      },
      {
        id: "p3",
        title: "Swarm Robotics Simulation",
        description:
          "Simulate swarm behavior of multiple robots performing collective tasks using Python and ROS.",
      },
    ],
  },
  {
    name: "Dr. Lisa Park",
    email: "lisa.park@happyresearch.org",
    bio: "Geneticist and bioinformatician working at the intersection of genomics and precision medicine. I am excited to mentor students who want to understand the language of life.",
    degree: "Doctor of Philosophy (PhD)",
    university: "UC Berkeley",
    expertise: "Genomics & Bioinformatics",
    researchArea: "Precision Medicine & Cancer Genomics",
    yearsOfExperience: "8",
    languages: "English, Korean",
    gender: "Female",
    website: "https://linkedin.com/in/lisapark",
    rating: 4.7,
    projects: [
      {
        id: "p1",
        title: "BRCA Gene Mutation Analyzer",
        description:
          "Build a bioinformatics pipeline to identify BRCA1/BRCA2 mutations from genomic sequencing data.",
      },
      {
        id: "p2",
        title: "Ancestry Prediction from DNA",
        description:
          "Use public genomic datasets to build a machine learning model that predicts geographic ancestry.",
      },
    ],
  },
  {
    name: "Prof. Robert Thompson",
    email: "robert.thompson@happyresearch.org",
    bio: "Cybersecurity expert with experience in both academia and industry. I have helped Fortune 500 companies secure their systems and love teaching the next generation of ethical hackers.",
    degree: "Doctor of Philosophy (PhD)",
    university: "Georgia Tech",
    expertise: "Cybersecurity & Cryptography",
    researchArea: "Zero-Knowledge Proofs & Privacy",
    yearsOfExperience: "13",
    languages: "English",
    gender: "Male",
    website: "https://linkedin.com/in/robertthompson",
    rating: 4.8,
    projects: [
      {
        id: "p1",
        title: "Password Strength Analyzer",
        description:
          "Build a tool that analyzes password strength using entropy calculations and common attack pattern databases.",
      },
      {
        id: "p2",
        title: "Network Intrusion Detection System",
        description:
          "Develop an ML-based system that detects anomalous network traffic patterns indicating potential cyberattacks.",
      },
      {
        id: "p3",
        title: "Phishing Email Detector",
        description:
          "Train a natural language processing model to classify emails as phishing or legitimate with high accuracy.",
      },
    ],
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@happyresearch.org",
    bio: "Materials scientist specializing in sustainable polymers and biodegradable plastics. My research aims to solve the global plastic crisis one molecule at a time.",
    degree: "Doctor of Philosophy (PhD)",
    university: "University of Cambridge",
    expertise: "Materials Science & Green Chemistry",
    researchArea: "Biodegradable Polymers",
    yearsOfExperience: "6",
    languages: "English, Hindi, Tamil",
    gender: "Female",
    website: "https://linkedin.com/in/priyasharma",
    rating: 4.6,
    projects: [
      {
        id: "p1",
        title: "Banana Peel Bioplastic",
        description:
          "Extract cellulose from banana peels and fabricate biodegradable plastic films, testing their mechanical properties.",
      },
      {
        id: "p2",
        title: "Algae-Based Packaging Material",
        description:
          "Develop and test seaweed-derived polymer packaging as a sustainable alternative to Styrofoam.",
      },
    ],
  },
  {
    name: "Dr. David Kim",
    email: "david.kim@happyresearch.org",
    bio: "Astrophysicist fascinated by exoplanets and the search for life beyond Earth. I use computational methods to analyze telescope data and love inspiring students to look up at the stars.",
    degree: "Doctor of Philosophy (PhD)",
    university: "Princeton University",
    expertise: "Astrophysics & Planetary Science",
    researchArea: "Exoplanet Detection & Characterization",
    yearsOfExperience: "7",
    languages: "English, Korean, Japanese",
    gender: "Male",
    website: "https://linkedin.com/in/davidkim",
    rating: 4.9,
    projects: [
      {
        id: "p1",
        title: "Exoplanet Transit Light Curve Analysis",
        description:
          "Analyze Kepler telescope photometry data to detect and characterize exoplanet transits using Python.",
      },
      {
        id: "p2",
        title: "Habitable Zone Calculator",
        description:
          "Build an interactive tool that calculates the habitable zone of any star based on its luminosity and temperature.",
      },
      {
        id: "p3",
        title: "Meteor Shower Predictor",
        description:
          "Develop a model that predicts meteor shower intensity based on Earth's orbital position and comet debris trails.",
      },
    ],
  },
];

export async function seedTeachers() {
  for (const teacher of teachers) {
    await addDoc(collection(db, "teachers"), {
      ...teacher,
      photoURL: null,
      createdAt: new Date(),
    });
    console.log(`Added: ${teacher.name}`);
  }
  console.log("Done! 10 teachers added.");
}
