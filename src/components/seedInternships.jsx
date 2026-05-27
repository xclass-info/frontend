import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const internships = [
  {
    title: "AI Research Intern",
    field: "Computer Science / AI",
    description:
      "Work on cutting-edge machine learning models for natural language processing. You will help build and evaluate transformer-based models for text classification tasks.",
    requirements:
      "Basic Python programming, curiosity about AI, high school or college level math.",
    outcomes:
      "Hands-on experience with PyTorch, understanding of NLP pipelines, co-authorship opportunity on research paper.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 3,
    deadline: "2026-07-01",
  },
  {
    title: "Climate Data Science Intern",
    field: "Environmental Science / Data Science",
    description:
      "Analyze large climate datasets to identify patterns in global temperature changes. Work with real NASA satellite data and build predictive models.",
    requirements:
      "Basic statistics knowledge, interest in climate change, familiarity with Excel or Python.",
    outcomes:
      "Experience with data visualization tools, understanding of climate modeling, research certificate.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 2,
    deadline: "2026-07-15",
  },
  {
    title: "Biomedical Engineering Research Intern",
    field: "Biomedical Engineering",
    description:
      "Assist in designing and testing low-cost prosthetic hand prototypes using 3D printing and Arduino microcontrollers.",
    requirements:
      "Interest in engineering, basic electronics knowledge, willingness to learn CAD software.",
    outcomes:
      "3D modeling skills, Arduino programming, understanding of biomechanics, potential publication.",
    duration: "6 months",
    mode: "In-Person",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-30",
  },
  {
    title: "Quantum Computing Intern",
    field: "Physics / Computer Science",
    description:
      "Explore quantum algorithms and their applications in cryptography and optimization problems using IBM Quantum Experience platform.",
    requirements:
      "Linear algebra, basic programming, curiosity about quantum mechanics.",
    outcomes:
      "Proficiency in Qiskit, understanding of quantum gates, research presentation skills.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 4,
    deadline: "2026-08-01",
  },
  {
    title: "Neuroscience Research Assistant",
    field: "Neuroscience / Biology",
    description:
      "Assist in analyzing EEG brain signal data from patients with sleep disorders to identify neural biomarkers.",
    requirements:
      "Biology or psychology background, attention to detail, basic statistics.",
    outcomes:
      "EEG data analysis skills, neuroscience research methodology, co-authorship opportunity.",
    duration: "5 months",
    mode: "Hybrid",
    stipend: "Academic Credit",
    spots: 3,
    deadline: "2026-07-20",
  },
  {
    title: "Robotics Software Intern",
    field: "Robotics / Computer Science",
    description:
      "Develop software for autonomous navigation of small ground robots using ROS (Robot Operating System) and computer vision.",
    requirements:
      "Python or C++ programming, interest in robotics, problem-solving mindset.",
    outcomes:
      "ROS framework experience, computer vision skills, autonomous systems understanding.",
    duration: "4 months",
    mode: "In-Person",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-15",
  },
  {
    title: "Cybersecurity Research Intern",
    field: "Computer Science / Cybersecurity",
    description:
      "Research vulnerabilities in IoT devices and develop lightweight encryption protocols for smart home security systems.",
    requirements:
      "Basic networking knowledge, interest in security, Python programming.",
    outcomes:
      "Penetration testing skills, cryptography fundamentals, CVE reporting experience.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Paid",
    spots: 3,
    deadline: "2026-07-10",
  },
  {
    title: "Genomics Data Analysis Intern",
    field: "Bioinformatics / Genetics",
    description:
      "Analyze human genomic datasets to identify genetic variants associated with Type 2 diabetes using bioinformatics tools.",
    requirements:
      "Biology knowledge, basic programming or R/Python, statistical thinking.",
    outcomes:
      "Bioinformatics pipeline skills, genomic data interpretation, research poster presentation.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 2,
    deadline: "2026-08-15",
  },
  {
    title: "Social Media Analytics Intern",
    field: "Data Science / Social Science",
    description:
      "Mine and analyze Twitter/X data to study misinformation spread patterns during public health crises using NLP techniques.",
    requirements:
      "Python basics, interest in social media research, curiosity about data patterns.",
    outcomes:
      "Social network analysis skills, NLP experience, understanding of misinformation dynamics.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 4,
    deadline: "2026-07-25",
  },
  {
    title: "Materials Science Research Intern",
    field: "Chemistry / Materials Science",
    description:
      "Synthesize and characterize novel polymer composites for flexible electronics applications in wearable devices.",
    requirements:
      "Chemistry or physics background, lab safety awareness, attention to detail.",
    outcomes:
      "Lab synthesis techniques, spectroscopy analysis, materials characterization skills.",
    duration: "6 months",
    mode: "In-Person",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-20",
  },
  {
    title: "Education Technology Research Intern",
    field: "Education / Computer Science",
    description:
      "Develop and test adaptive learning algorithms that personalize educational content based on student performance data.",
    requirements:
      "Interest in education, basic programming, understanding of learning theories.",
    outcomes:
      "EdTech development skills, learning analytics experience, curriculum design knowledge.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Academic Credit",
    spots: 3,
    deadline: "2026-07-30",
  },
  {
    title: "Astrophysics Computation Intern",
    field: "Physics / Astrophysics",
    description:
      "Process and analyze data from radio telescope observations to search for patterns consistent with exoplanet transits.",
    requirements:
      "Physics or math background, Python programming, interest in space science.",
    outcomes:
      "Astronomical data processing, Python astronomy libraries, research methodology.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 2,
    deadline: "2026-08-10",
  },
  {
    title: "Public Health Data Intern",
    field: "Public Health / Epidemiology",
    description:
      "Analyze epidemiological data to model disease spread in urban populations and evaluate intervention effectiveness.",
    requirements:
      "Statistics knowledge, interest in public health, Excel or R basics.",
    outcomes:
      "Epidemiological modeling skills, health data visualization, policy analysis experience.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 3,
    deadline: "2026-07-05",
  },
  {
    title: "Renewable Energy Systems Intern",
    field: "Electrical Engineering / Energy",
    description:
      "Design and simulate solar-wind hybrid energy systems for rural electrification using MATLAB and real field data.",
    requirements:
      "Physics or engineering background, MATLAB basics or willingness to learn, math proficiency.",
    outcomes:
      "Energy systems simulation, MATLAB proficiency, sustainable energy design skills.",
    duration: "5 months",
    mode: "Hybrid",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-25",
  },
  {
    title: "Computer Vision Research Intern",
    field: "Computer Science / AI",
    description:
      "Train and evaluate deep learning models for real-time object detection in autonomous vehicle perception systems.",
    requirements:
      "Python programming, basic machine learning knowledge, interest in computer vision.",
    outcomes:
      "PyTorch expertise, YOLO model training, autonomous systems understanding.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Paid",
    spots: 3,
    deadline: "2026-07-18",
  },
  {
    title: "Ocean Microplastics Research Intern",
    field: "Marine Biology / Environmental Science",
    description:
      "Develop and test microplastic detection methods using spectroscopy and machine learning to analyze ocean water samples.",
    requirements: "Science background, lab interest, attention to detail.",
    outcomes:
      "Spectroscopy techniques, environmental sampling methods, data analysis skills.",
    duration: "3 months",
    mode: "In-Person",
    stipend: "Academic Credit",
    spots: 2,
    deadline: "2026-07-12",
  },
  {
    title: "Financial Technology Research Intern",
    field: "Finance / Computer Science",
    description:
      "Research blockchain-based decentralized finance protocols and analyze their security vulnerabilities and economic models.",
    requirements:
      "Basic programming, interest in finance or economics, analytical mindset.",
    outcomes:
      "Blockchain development basics, DeFi protocol analysis, financial modeling skills.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 4,
    deadline: "2026-08-05",
  },
  {
    title: "Cognitive Psychology Research Intern",
    field: "Psychology / Neuroscience",
    description:
      "Conduct online experiments to study how social media use affects attention span and working memory in teenagers.",
    requirements:
      "Psychology or science interest, good communication skills, ethical research awareness.",
    outcomes:
      "Experimental design skills, statistical analysis, research ethics certification.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 3,
    deadline: "2026-07-22",
  },
  {
    title: "Smart Agriculture Technology Intern",
    field: "Agricultural Science / IoT",
    description:
      "Build IoT sensor networks for precision farming that monitor soil moisture, temperature and nutrient levels in real time.",
    requirements:
      "Electronics interest, basic programming, curiosity about agriculture technology.",
    outcomes:
      "IoT hardware skills, sensor data analysis, agricultural technology understanding.",
    duration: "5 months",
    mode: "Hybrid",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-28",
  },
  {
    title: "Drug Discovery Computational Intern",
    field: "Chemistry / Bioinformatics",
    description:
      "Use molecular docking simulations to screen thousands of candidate compounds for potential anti-cancer drug properties.",
    requirements:
      "Chemistry or biology background, computer interest, scientific curiosity.",
    outcomes:
      "Molecular simulation software skills, drug discovery pipeline knowledge, research presentation.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 3,
    deadline: "2026-07-28",
  },
  {
    title: "Urban Planning Data Science Intern",
    field: "Urban Planning / Data Science",
    description:
      "Analyze city traffic and mobility data to optimize public transportation routes using graph theory and machine learning.",
    requirements:
      "Math or data interest, Python basics, interest in city planning.",
    outcomes:
      "Graph algorithms, GIS mapping skills, urban data analysis experience.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Academic Credit",
    spots: 3,
    deadline: "2026-08-08",
  },
  {
    title: "Wearable Health Tech Intern",
    field: "Biomedical Engineering / Electronics",
    description:
      "Design and prototype a wearable ECG monitor that can detect early signs of cardiac arrhythmia using signal processing.",
    requirements:
      "Electronics or engineering interest, basic programming, attention to detail.",
    outcomes:
      "Signal processing skills, wearable hardware prototyping, medical device regulations awareness.",
    duration: "5 months",
    mode: "In-Person",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-22",
  },
  {
    title: "Language Preservation Research Intern",
    field: "Linguistics / Computer Science",
    description:
      "Build digital archives and NLP tools to document and preserve endangered indigenous languages from audio recordings.",
    requirements:
      "Linguistics or language interest, Python basics, cultural sensitivity.",
    outcomes:
      "NLP for low-resource languages, digital archiving skills, linguistic documentation methods.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 3,
    deadline: "2026-07-16",
  },
  {
    title: "Space Weather Prediction Intern",
    field: "Physics / Space Science",
    description:
      "Develop machine learning models to predict solar flares and geomagnetic storms using satellite magnetometer data.",
    requirements:
      "Physics or math background, Python programming, space science curiosity.",
    outcomes:
      "Time series forecasting, space physics knowledge, ML model deployment skills.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 2,
    deadline: "2026-08-12",
  },
  {
    title: "Food Science Innovation Intern",
    field: "Food Science / Chemistry",
    description:
      "Research plant-based protein alternatives to meat by testing nutritional profiles, texture and flavor enhancement techniques.",
    requirements:
      "Chemistry or biology background, lab interest, food science curiosity.",
    outcomes:
      "Food analysis techniques, protein chemistry knowledge, product development process.",
    duration: "4 months",
    mode: "In-Person",
    stipend: "Academic Credit",
    spots: 2,
    deadline: "2026-07-08",
  },
  {
    title: "Digital Mental Health Research Intern",
    field: "Psychology / Computer Science",
    description:
      "Develop and validate a smartphone app that uses AI to detect early signs of depression from typing patterns and usage behavior.",
    requirements:
      "Psychology or CS interest, ethical research awareness, basic app understanding.",
    outcomes:
      "Digital health research methodology, ethical AI awareness, mental health tech skills.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 3,
    deadline: "2026-07-26",
  },
  {
    title: "Earthquake Engineering Research Intern",
    field: "Civil Engineering / Seismology",
    description:
      "Simulate seismic responses of building structures using finite element analysis to improve earthquake-resistant design standards.",
    requirements:
      "Physics or engineering background, math proficiency, detail-oriented.",
    outcomes:
      "FEA software skills, structural analysis knowledge, seismic design standards understanding.",
    duration: "5 months",
    mode: "Hybrid",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-18",
  },
  {
    title: "Pediatric Health Analytics Intern",
    field: "Medicine / Data Science",
    description:
      "Analyze anonymized electronic health records of pediatric patients to identify risk factors for childhood obesity using ML.",
    requirements:
      "Health or data interest, statistics basics, data privacy awareness.",
    outcomes:
      "Health data analysis, predictive modeling, medical research ethics knowledge.",
    duration: "3 months",
    mode: "Remote",
    stipend: "Academic Credit",
    spots: 3,
    deadline: "2026-08-03",
  },
  {
    title: "Wildfire Risk Modeling Intern",
    field: "Environmental Science / Data Science",
    description:
      "Build predictive models using satellite imagery and weather data to forecast wildfire risk in Western US regions.",
    requirements:
      "Science or data interest, Python basics, interest in environmental issues.",
    outcomes:
      "Remote sensing analysis, GIS skills, environmental risk modeling experience.",
    duration: "4 months",
    mode: "Remote",
    stipend: "Unpaid",
    spots: 3,
    deadline: "2026-07-14",
  },
  {
    title: "Soft Robotics Research Intern",
    field: "Mechanical Engineering / Robotics",
    description:
      "Design and fabricate soft pneumatic actuators inspired by octopus tentacles for use in minimally invasive surgical robots.",
    requirements:
      "Engineering or biology interest, hands-on mindset, creativity.",
    outcomes:
      "Soft robotics fabrication, biomimetic design principles, surgical robotics awareness.",
    duration: "6 months",
    mode: "In-Person",
    stipend: "Paid",
    spots: 2,
    deadline: "2026-06-10",
  },
];

export async function seedInternships() {
  for (const internship of internships) {
    await addDoc(collection(db, "internships"), {
      ...internship,
      teacherId: "admin",
      teacherName: "HappyResearch Team",
      applicants: 0,
      status: "open",
      createdAt: new Date(),
    });
    console.log(`Added: ${internship.title}`);
  }
  console.log("Done! 30 internships added.");
}
