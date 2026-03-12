import React from "react";
import { Database, Cloud, Package } from "lucide-react";

export default function AskFieldFeatures() {
  const features = [
    {
      icon: Database,
      title: "Seamless Setup",
      description:
        "Lorem ipsum is a dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since. It has survived not only five centuries, but also the leap into electronic typesetting.",
    },
    {
      icon: Cloud,
      title: "Rapid Responses",
      description:
        "Lorem ipsum is a dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since. It has survived not only five centuries, but also the leap into electronic typesetting.",
    },
    {
      icon: Package,
      title: "Faster Breakthroughs",
      description:
        "Lorem ipsum is a dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since. It has survived not only five centuries, but also the leap into electronic typesetting.",
    },
  ];

  return (
    <div className="min-h-screen from-gray-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-1">
            <span className="italic">ask</span>Field Makes It Easy To Access
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-black">
            The Highest-Quality Data
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-brand-gradient rounded-3xl p-8  duration-300 hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-[#FAE6B5] rounded-2xl p-4 shadow-sm border border-[#FBC02D]">
                    <Icon className="w-8 h-8 text-[#FBC02D]" strokeWidth={2} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-700 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
