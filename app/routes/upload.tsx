import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FIleUploader";
import { type FormEvent, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdftoimage";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                 }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);

        try {
            // STEP 1: Upload original PDF
            setStatusText("Uploading your resume...");

            const uploadedFile = await fs.upload([file]);

            if (!uploadedFile) {
                setStatusText("Error: Failed to upload resume");
                return;
            }

            console.log("PDF uploaded:", uploadedFile);

            // STEP 2: Convert PDF to image
            setStatusText("Converting resume to image...");

            const imageFile = await convertPdfToImage(file);

            if (!imageFile.file) {
                setStatusText(
                    `Error: ${
                        imageFile.error ?? "Failed to convert PDF to image"
                    }`
                );
                return;
            }

            console.log("PDF converted:", imageFile.file);

            // STEP 3: Upload converted image
            setStatusText("Uploading resume preview...");

            const uploadedImage = await fs.upload([imageFile.file]);

            if (!uploadedImage) {
                setStatusText("Error: Failed to upload resume image");
                return;
            }

            console.log("Image uploaded:", uploadedImage);

            // STEP 4: Create resume record
            setStatusText("Preparing resume data...");

            const uuid = generateUUID();

            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: "",
            };

            // Use ONE consistent key
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            console.log("Initial resume data saved:", data);

            // STEP 5: Run AI analysis
            setStatusText("Analyzing your resume...");

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions(jobTitle, jobDescription)
            );

            if (!feedback) {
                setStatusText("Error: Failed to analyze resume");
                return;
            }

            console.log("AI response:", feedback);

            // STEP 6: Extract AI response text
            const feedbackText =
                typeof feedback.message.content === "string"
                    ? feedback.message.content
                    : feedback.message.content[0].text;

            console.log("AI feedback text:", feedbackText);

            const cleanedFeedbackText = feedbackText
                .replace(/^```json\s*/i, "")
                .replace(/```$/i, "")
                .trim();

            try {
                data.feedback = JSON.parse(cleanedFeedbackText);

                console.log("Parsed feedback:", data.feedback);
            } catch (error) {
                console.error("JSON PARSE FAILED:", error);
                console.error("RAW AI RESPONSE:", cleanedFeedbackText);

                setStatusText(
                    "Error: AI returned incomplete feedback. Please try again."
                );

                return;
            }

// STEP 8: Update SAME KV record
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            console.log("Completed resume data saved:", data);

// STEP 9: Redirect
            setStatusText("Analysis complete. Redirecting...");

            navigate(`/resume/${uuid}`);
        } catch (error) {
            console.error("RESUME ANALYSIS ERROR:", error);

            const message =
                error instanceof Error ? error.message : String(error);

            if (message.includes("No usage left")) {
                setStatusText(
                    "AI usage limit reached. Please try again later."
                );
                return;
            }

            setStatusText(`Error: ${message}`);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;

        if (!file) {
            setStatusText("Please upload a PDF resume");
            return;
        }

        handleAnalyze({
            companyName,
            jobTitle,
            jobDescription,
            file,
        });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section py-16">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your resumes</h1>

                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>

                            <img
                                src="/images/resume-scan.gif"
                                className="w-full"
                                alt="Resume scanning"
                            />
                        </>
                    ) : (
                        <h2>
                            Drop your resume for an ATS score and improvement tips
                        </h2>
                    )}

                    {!isProcessing && (
                        <form
                            id="upload-form"
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8"
                        >
                            <div className="form-div">
                                <label htmlFor="company-name">
                                    Company Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    name="company-name"
                                    id="company-name"
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-title">
                                    Job Title
                                </label>

                                <input
                                    type="text"
                                    placeholder="Job Title"
                                    name="job-title"
                                    id="job-title"
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description">
                                    Job Description
                                </label>

                                <textarea
                                    rows={5}
                                    placeholder="Job Description"
                                    name="job-description"
                                    id="job-description"
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">
                                    Upload Resume
                                </label>

                                <FileUploader
                                    onFileSelect={handleFileSelect}
                                />
                            </div>

                            <button
                                className="primary-button"
                                type="submit"
                            >
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;