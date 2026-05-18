import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface FAQ {
  id: number;
  number: string;
  title: string;
  content: string;
}

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      id: 1,
      number: "01/",
      title: "What is joinStudy?",
      content:
        "joinStudy is a participant recruitment platform that helps researchers find, screen, and manage research participants globally.",
    },
    {
      id: 2,
      number: "02/",
      title: "Who can use joinStudy?",
      content:
        "Researchers, academic teams, product teams, NGOs, AI companies, and organizations that need participants for ethical research studies.",
    },
    {
      id: 3,
      number: "03/",
      title: "Can participants outside the Global South join?",
      content:
        "Yes. joinStudy supports global participation. The platform has strong access to underrepresented Global South communities but is not limited to them.",
    },
    {
      id: 4,
      number: "04/",
      title: "What types of studies can researchers run?",
      content:
        "Surveys, interviews, focus groups, usability tests, academic studies, product research, AI evaluation studies, and field/community research.",
    },
    {
      id: 5,
      number: "05/",
      title: "Do participants get paid?",
      content:
        "Many studies include compensation. Each study should clearly show the amount, currency, method, and timing before participants apply.",
    },
    {
      id: 6,
      number: "06/",
      title: "How does joinStudy protect participants?",
      content:
        "Studies should clearly explain purpose, eligibility, time commitment, compensation, and data use. Participants choose which studies to apply for.",
    },
    {
      id: 7,
      number: "07/",
      title: "Does joinStudy support IRB or ethics review?",
      content:
        "Researchers can include consent and ethics information for their studies. Academic researchers can upload or describe ethics approval where required.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 ">
      <h1 className="text-4xl font-bold text-center mb-12">
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-white rounded-lg overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">
                  {faq.number}
                </span>
                <h3 className="text-xl font-semibold text-gray-900">
                  {faq.title}
                </h3>
              </div>

              <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center transition-transform duration-300">
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-white" />
                ) : (
                  <Plus className="w-5 h-5 text-white" />
                )}
              </div>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pt-2">
                <p className="text-gray-700 leading-relaxed pl-12">
                  {faq.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
