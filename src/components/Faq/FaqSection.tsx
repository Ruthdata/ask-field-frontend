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
      title: "What is askField?",
      content:
        "With this data management solution, we now have full control over our data, and the insights we've gained have had a huge impact on our decision-making process. It has empowered us to make informed choices that improve our overall operations and drive growth. We couldn't be more satisfied",
    },
    {
      id: 2,
      number: "02/",
      title: "How does askField ensure data quality?",
      content:
        "With this data management solution, we now have full control over our data, and the insights we've gained have had a huge impact on our decision-making process. It has empowered us to make informed choices that improve our overall operations and drive growth. We couldn't be more satisfied",
    },
    {
      id: 3,
      number: "03/",
      title: "Can I customize my surveys on askField?",
      content:
        "With this data management solution, we now have full control over our data, and the insights we've gained have had a huge impact on our decision-making process. It has empowered us to make informed choices that improve our overall operations and drive growth. We couldn't be more satisfied",
    },
    {
      id: 4,
      number: "04/",
      title: "What support options are available?",
      content:
        "With this data management solution, we now have full control over our data, and the insights we've gained have had a huge impact on our decision-making process. It has empowered us to make informed choices that improve our overall operations and drive growth. We couldn't be more satisfied",
    },
    {
      id: 5,
      number: "05/",
      title: "How secure is my data with askField?",
      content:
        "With this data management solution, we now have full control over our data, and the insights we've gained have had a huge impact on our decision-making process. It has empowered us to make informed choices that improve our overall operations and drive growth. We couldn't be more satisfied",
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