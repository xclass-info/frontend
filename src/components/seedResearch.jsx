import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const researches = [
  {
    title: "AI-Powered Early Detection of Alzheimer's Disease",
    idea: "Using machine learning algorithms to analyze MRI brain scans and detect early signs of Alzheimer's disease before clinical symptoms appear.",
    impact:
      "Could enable treatment up to 10 years earlier, significantly slowing disease progression and improving quality of life for millions of patients worldwide.",
    details:
      "The model uses convolutional neural networks trained on 50,000+ MRI scans to identify subtle structural changes in the hippocampus.",
  },
  {
    title: "Solar-Powered Water Purification for Rural Communities",
    idea: "Developing low-cost solar-powered filtration systems using locally sourced materials to provide clean drinking water in off-grid communities.",
    impact:
      "Could provide clean water access to over 2 billion people currently lacking safe drinking water, reducing waterborne disease mortality by 60%.",
    details:
      "The system uses photovoltaic panels combined with ceramic filters and UV sterilization, costing under $50 to build.",
  },
  {
    title: "Quantum Computing for Drug Discovery",
    idea: "Applying quantum algorithms to simulate molecular interactions at the atomic level, dramatically accelerating the drug discovery process.",
    impact:
      "Could reduce drug development time from 12 years to under 2 years and cut costs from $2.6 billion to under $100 million per drug.",
    details:
      "Using variational quantum eigensolvers to model protein folding and drug-receptor binding with unprecedented accuracy.",
  },
  {
    title: "Biodegradable Microplastic Alternatives",
    idea: "Engineering plant-based polymers that mimic plastic properties but fully decompose within 90 days in natural environments.",
    impact:
      "Could eliminate 380 million tons of plastic waste produced annually, reversing ocean microplastic contamination within decades.",
    details:
      "Using cellulose nanocrystals from agricultural waste combined with natural resins to achieve plastic-like strength and flexibility.",
  },
  {
    title: "Neural Interface for Paralyzed Patients",
    idea: "Developing non-invasive brain-computer interfaces using advanced EEG signal processing to restore motor function in paralyzed patients.",
    impact:
      "Could restore independence to 5.4 million Americans living with paralysis, enabling control of prosthetics and smart home devices.",
    details:
      "The system decodes motor intention signals with 94% accuracy using deep learning, requiring only a lightweight headset.",
  },
  {
    title: "Carbon-Negative Concrete Production",
    idea: "Replacing traditional cement with biochar and volcanic ash composites that actively absorb CO2 during the curing process.",
    impact:
      "Could transform the construction industry from producing 8% of global CO2 emissions to becoming a net carbon sink.",
    details:
      "The biochar composite absorbs 200kg of CO2 per ton of concrete produced while maintaining structural integrity.",
  },
  {
    title: "Personalized Cancer Immunotherapy Using AI",
    idea: "Using AI to analyze a patient's unique tumor genetics and immune profile to design personalized immunotherapy treatments.",
    impact:
      "Could increase cancer survival rates by 40% by tailoring treatments to individual patients rather than using generalized protocols.",
    details:
      "The AI model analyzes over 20,000 genetic markers to predict optimal checkpoint inhibitor combinations for each patient.",
  },
  {
    title: "Vertical Farming with Minimal Water Usage",
    idea: "Developing aeroponic vertical farming systems that grow crops using 95% less water than traditional agriculture.",
    impact:
      "Could enable food production in water-scarce regions, feeding 1 billion people currently facing food insecurity.",
    details:
      "The system delivers nutrients directly to plant roots via fine mist, eliminating soil while maximizing yield per square meter.",
  },
  {
    title: "Blockchain for Academic Credential Verification",
    idea: "Creating a decentralized blockchain system for instantly verifying academic credentials, eliminating diploma fraud globally.",
    impact:
      "Could save institutions $1 billion annually spent on credential verification while eliminating 40% of fraudulent applications.",
    details:
      "Smart contracts automatically verify and issue tamper-proof digital credentials linked to institutional cryptographic keys.",
  },
  {
    title: "AI Tutoring System for Dyslexic Students",
    idea: "Developing adaptive AI tutoring software that detects dyslexia patterns and automatically adjusts teaching methods in real time.",
    impact:
      "Could improve literacy outcomes for 780 million dyslexic individuals worldwide who currently lack adequate educational support.",
    details:
      "The system uses eye-tracking and typing pattern analysis to identify learning difficulties and adapt content presentation.",
  },
  {
    title: "Autonomous Wildfire Detection Drones",
    idea: "Deploying networks of solar-powered autonomous drones equipped with thermal cameras and AI to detect wildfires within minutes of ignition.",
    impact:
      "Could reduce wildfire damage by 80% through early detection, saving billions in property damage and countless lives annually.",
    details:
      "Each drone covers 500 square kilometers and communicates via mesh network, requiring no ground infrastructure.",
  },
  {
    title: "Gene Therapy for Inherited Blindness",
    idea: "Using CRISPR gene editing to correct mutations in the RPE65 gene responsible for Leber congenital amaurosis, a form of inherited blindness.",
    impact:
      "Could restore vision to hundreds of thousands of people born blind due to genetic mutations, with a single treatment.",
    details:
      "Viral vectors deliver corrected gene sequences directly to retinal cells with 87% success rate in animal trials.",
  },
  {
    title: "Ocean Thermal Energy Conversion",
    idea: "Harnessing the temperature difference between warm surface water and cold deep ocean water to generate continuous renewable electricity.",
    impact:
      "Could provide 24/7 renewable energy to coastal nations covering 90% of tropical island energy needs with zero emissions.",
    details:
      "The system achieves 15% thermal efficiency using advanced ammonia working fluid cycles and deep-sea heat exchangers.",
  },
  {
    title: "Gut Microbiome Mapping for Mental Health",
    idea: "Analyzing the gut microbiome composition of patients with depression and anxiety to identify microbial biomarkers and develop probiotic treatments.",
    impact:
      "Could provide new treatment pathways for 1 billion people suffering from mental health disorders resistant to current medications.",
    details:
      "Metagenomic sequencing of 10,000 patient samples revealed 23 bacterial species strongly correlated with depression severity.",
  },
  {
    title: "Earthquake Early Warning Using IoT Sensors",
    idea: "Deploying low-cost IoT seismic sensor networks in earthquake-prone regions to provide 60-second warnings before major tremors.",
    impact:
      "Could save thousands of lives annually by enabling evacuation and automatic shutdown of critical infrastructure before earthquakes strike.",
    details:
      "Each sensor costs under $10 and communicates via LoRaWAN, enabling dense deployment in developing nations.",
  },
  {
    title: "Artificial Photosynthesis for Clean Fuel",
    idea: "Developing synthetic leaf technology that mimics photosynthesis to convert sunlight and water directly into hydrogen fuel.",
    impact:
      "Could provide limitless clean hydrogen fuel, replacing fossil fuels in transportation and industry with zero carbon emissions.",
    details:
      "Semiconductor catalysts coated with cobalt-phosphate achieve 10% solar-to-hydrogen conversion efficiency.",
  },
  {
    title: "Predictive Analytics for Student Dropout Prevention",
    idea: "Using machine learning to analyze student behavior patterns and predict dropout risk months in advance, enabling early intervention.",
    impact:
      "Could reduce university dropout rates by 35%, saving students from financial hardship and institutions from revenue losses.",
    details:
      "The model analyzes 50+ behavioral indicators including attendance, assignment submission and library usage with 89% prediction accuracy.",
  },
  {
    title: "Smart Prosthetics with Sensory Feedback",
    idea: "Developing prosthetic limbs with embedded pressure sensors that transmit tactile sensations directly to the user's nervous system.",
    impact:
      "Could restore natural touch sensation to 2 million amputees worldwide, dramatically improving prosthetic adoption and quality of life.",
    details:
      "Piezoelectric sensors map pressure to neural stimulation patterns, enabling users to feel texture and temperature.",
  },
  {
    title: "Coral Reef Restoration Using 3D Printing",
    idea: "Using 3D printing technology to create artificial reef structures from pH-neutral ceramic materials that mimic natural coral architecture.",
    impact:
      "Could accelerate coral reef recovery by 10x compared to natural regeneration, protecting marine ecosystems supporting 25% of ocean life.",
    details:
      "Ceramic structures are seeded with coral larvae in nurseries before deployment, achieving 70% coral colonization within 6 months.",
  },
  {
    title: "Zero-Knowledge Proof Privacy for Healthcare Data",
    idea: "Applying zero-knowledge cryptographic proofs to enable medical researchers to analyze patient data without ever accessing personal information.",
    impact:
      "Could unlock vast medical datasets currently inaccessible due to privacy laws, accelerating medical research by decades.",
    details:
      "ZK-SNARK protocols allow statistical analysis of encrypted patient records with mathematical proof of data validity.",
  },
];

export async function seedResearch() {
  for (const research of researches) {
    await addDoc(collection(db, "research"), {
      ...research,
      teacherId: "admin",
      teacherName: "HappyResearch Team",
      createdAt: new Date(),
      status: "published",
    });
    console.log(`Added: ${research.title}`);
  }
  console.log("Done! 20 research entries added.");
}
