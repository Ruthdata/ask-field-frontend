import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ExternalLink,
  Image,
  Info,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Underline,
  Upload,
} from "lucide-react";
import { useState } from "react";

const editorTools = [
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  List,
  ListOrdered,
  Image,
  LinkIcon,
];

const RichTextBox = ({ placeholder }: { placeholder: string }) => (
  <div className="rounded-lg bg-gray-50 px-4 py-3 min-h-26">
    <div className="flex items-center gap-3 text-gray-500">
      {editorTools.map((Icon, index) => (
        <button
          key={index}
          type="button"
          className="h-5 w-5 flex items-center justify-center hover:text-gray-900"
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
    <textarea
      placeholder={placeholder}
      className="mt-3 h-12 w-full resize-none bg-transparent text-xs outline-none placeholder:text-gray-400"
    />
  </div>
);

const AiTaskBuilder = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
      <div className="max-w-6xl">
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-950">
                AI Task Builder
              </h1>
              <p className="mt-3 text-xs text-gray-900">
                Get text data annotated by participants on Prolific, in one
                integration workflow
              </p>
            </div>
            <button
              type="button"
              className="w-full rounded-3xl bg-[#3E3E3E] px-6 py-3 text-xs text-white sm:w-auto"
            >
              Explore AI task builder
            </button>
          </div>

          {step === 1 ? (
            <div className="mt-5">
              <h2 className="text-xs font-semibold text-gray-800">
                Upload your Data
              </h2>

              <div className="mt-4 rounded-xl border border-gray-100 p-4 sm:p-5">
                <label className="text-xs font-medium text-gray-900">
                  Name your batch of tasks
                </label>
                <input
                  type="text"
                  placeholder="Enter task's batch name"
                  className="mt-3 w-full rounded-lg bg-gray-50 px-4 py-4 text-xs outline-none placeholder:text-gray-400"
                />

                <p className="mt-4 text-xs font-medium text-gray-900">
                  Upload your data via CSV
                </p>
                <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
                  <Upload size={18} className="text-gray-700" />
                  <p className="mt-3 text-xs text-gray-900">
                    Drag and drop files here
                  </p>
                  <p className="mt-2 text-[11px] text-gray-400">
                    Maximum file size is 5GB
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-3xl bg-gray-200 px-12 py-3 text-xs text-gray-700"
                  >
                    Browse files
                  </button>
                </div>

                <p className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                  <Info size={13} />
                  Supported format: CSV
                </p>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h2 className="text-xs font-semibold text-gray-800">
                  Introducing authenticity checks
                </h2>
                <p className="mt-4 max-w-xl text-xs leading-5 text-gray-950">
                  Catch AI-generated responses with 98.7% accuracy, so you have
                  confidence your data is authentic.
                </p>
                <div className="mt-4 space-y-1 text-xs text-gray-950">
                  <p>✓ All free-text responses checked</p>
                  <p>✓ See and sort flagged responses</p>
                  <p>✓ Included for all AI Task Builder projects</p>
                </div>
                <a
                  href="#"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] text-yellow-500"
                >
                  Read our full guidance <ExternalLink size={12} />
                </a>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <h2 className="text-xs font-semibold text-gray-800">
                  Flexible CSV Processing
                </h2>
                <ul className="mt-3 list-disc pl-5 text-xs leading-5 text-gray-950">
                  <li>
                    Upload any CSV format for AI tasks like RLHF, model
                    evaluation, or data labelling
                  </li>
                  <li>
                    Include a header row to define your columns. Organise your
                    data according to your need
                  </li>
                </ul>
                <a
                  href="#"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] text-yellow-500"
                >
                  For details, check the Help Centre <ExternalLink size={12} />
                </a>
                <label className="mt-3 flex items-center gap-3 text-[11px] text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  I have read and agreed to AI Task Builder{" "}
                  <span className="text-yellow-500">Terms & Conditions</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <h2 className="text-xs font-semibold text-gray-800">
                Task Details
              </h2>

              <div className="mt-4 rounded-xl border border-gray-100 p-4 sm:p-5">
                <label className="text-xs font-medium text-gray-900">
                  Task Name
                </label>
                <input
                  type="text"
                  placeholder="Enter task's batch name"
                  className="mt-3 w-full rounded-lg bg-gray-50 px-4 py-4 text-xs outline-none placeholder:text-gray-400"
                />

                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-900">
                    Task Introduction
                  </label>
                  <div className="mt-3">
                    <RichTextBox placeholder="Provide an introduction to the task" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-900">
                    Task Steps
                  </label>
                  <div className="mt-3">
                    <RichTextBox placeholder="Provide clear, detailed instructions" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-4 border-t border-gray-100 pt-5">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-3xl bg-gray-200 px-14 py-3 text-xs text-gray-700"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(prev + 1, 2))}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#3E3E3E] px-16 py-3 text-xs text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiTaskBuilder;
