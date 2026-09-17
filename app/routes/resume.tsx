// import { useParams, useNavigate } from "react-router";
// import {useEffect, useState} from "react";
// import {usePuterStore} from "~/lib/puter";
// import Summary from "~/components/Summary";
// import ATS from "~/components/ATS";
//
// export const meta = () => [
//   { title: "Resumeai | Review" },
//   { name: "description", content: "Detailed overview of your resume" },
// ];
//
// const Resume = () => {
//   const { id } = useParams();
//   const { auth, isLoading, fs, kv } = usePuterStore();
//   const [imageUrl, setImageUrl] = useState<string>();
//   const [resumeUrl, setResumeUrl] = useState<string>();
//   const [feedback, setFeedback] = useState<Feedback> || null>(null);
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
//   }, [auth.isAuthenticated]);
//
//   useEffect(() => {
//     const loadResume = async () => {
//       const resume = await kv.get(`/resume/${id}`);
//       if (!resume) return;
//
//       const data = JSON.parse(resume);
//
//       const resumeBlob = await fs.read(data.resumePath);
//       if (!resumeBlob) return;
//
//       const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
//       const resumeUrl = URL.createObjectURL(pdfBlob);
//       setResumeUrl(resumeUrl);
//
//       const imageBlob = await fs.read(data.imagePath);
//       if (!imageBlob) return;
//       const imageUrl = URL.createObjectURL(imageBlob);
//       setImageUrl(imageUrl);
//
//       setFeedback(data.feedaback);
//       console.log({resumeUrl, imageUrl, feedback: data.feedback});
//     };
//
//     loadResume();
//
//   }, [id]);
//
//   return (
//     <main className="!pt-0">
//       <nav className="resume-nav">
//         <Link to="/" className="back-button">
//           <img src="icons/back.svg" alt="Back" className="w-2.5 h-2.5" />
//           <span className="text-gray-800 text-sm font-semibold">
//             Back to Homepage
//           </span>
//         </Link>
//       </nav>
//       <div className="flex flex-row w-full max-lg:flex-col-reverse">
//         <section className="feedback-section bg-[url('/images/bg-smal..svg') bg-cover h-[100vh] sticky top-0items-center jsutify-center">
//           {imageUrl && resumeUrl && (
//             <div className=" animate-i fade-in duration-1000 gradient-border max-sm:m-0 h-fit w-fit">
//               <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
//                 <img
//                   src="w-full h-full object-contain rounded-2xl"/>
//               </a>
//             </div>
//           )}
//         </section>
//         <section className="feedback-section">
//           <h2 className="text-4xl text-black font-bold">
//             Resume Review
//           </h2>
//           {feedback ? (
//               <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
//                 <Summary feedback={feedback}/>
//                 <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}  />
//                 <Details feedback={feedback}/>
//
//               </div>
//           ) : (
//               <img src="/images/resume-scan-2.gif" className="w-full"/>
//           )}
//
//         </section>
//       </div>
//     </main>
//   );
// };
//
// export default Resume;


import { Link } from "react-router";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
  { title: "Resumeai | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const mockFeedback: Feedback = {
  overallScore: 72,

  ATS: {
    score: 68,
    tips: [
      {
        type: "good",
        tip: "Your resume contains relevant technical keywords.",
      },
      {
        type: "improve",
        tip: "Add more measurable achievements to your work experience.",
      },
    ],
  },

  toneAndStyle: {
    score: 75,
    tips: [],
  },

  content: {
    score: 70,
    tips: [],
  },

  structure: {
    score: 65,
    tips: [],
  },

  skills: {
    score: 82,
    tips: [],
  },
};

const Resume = () => {
  const feedback = mockFeedback;

  return (
      <main className="!pt-0">
        <nav className="resume-nav">
          <Link to="/" className="back-button">
            <img
                src="/icons/back.svg"
                alt="Back"
                className="w-2.5 h-2.5"
            />

            <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
          </Link>
        </nav>

        <div className="flex flex-row w-full max-lg:flex-col-reverse">
          <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">

            {/* Temporary resume preview */}
            <div className="gradient-border max-sm:m-0 h-fit w-fit">
              <img
                  src="/images/resume_01.png"
                  alt="Resume preview"
                  className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          </section>

          <section className="feedback-section">
            <h2 className="text-4xl text-black font-bold">
              Resume Review
            </h2>

            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />

              <ATS
                  score={feedback.ATS.score || 0}
                  suggestions={feedback.ATS.tips || []}
              />

              <Details feedback={feedback} />
            </div>
          </section>
        </div>
      </main>
  );
};

export default Resume;