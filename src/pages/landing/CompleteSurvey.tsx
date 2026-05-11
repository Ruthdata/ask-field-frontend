import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function CompleteSurvey() {
  const { getParticipantFirstName } = useCurrentUser();

  const [formData, setFormData] = useState({
    experience: "",
    favoriteFeature: "",
    improvement: "",
    recommend: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);

    // API CALL HERE

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center px-6">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-black text-white flex items-center justify-center text-3xl mb-6">
            ✓
          </div>

          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>

          <p className="text-gray-500 leading-relaxed">
            Thanks for completing the survey,{" "}
            <span className="font-semibold text-black">
              {getParticipantFirstName()}
            </span>
            . Your feedback helps us improve the experience for everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-6 text-3xl">
            ✦
          </div>

          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-4">
            Quick Survey
          </h1>

          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Hi{" "}
            <span className="font-semibold text-black">
              {getParticipantFirstName()}
            </span>
            , we’d love to hear your thoughts. This short survey will only take
            a minute.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-8"
        >
          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              How would you rate your experience?
            </label>

            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select an option</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {/* Favorite Feature */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What feature do you like the most?
            </label>

            <input
              type="text"
              name="favoriteFeature"
              value={formData.favoriteFeature}
              onChange={handleChange}
              placeholder="Tell us your favorite feature"
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Improvements */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What can we improve?
            </label>

            <textarea
              name="improvement"
              value={formData.improvement}
              onChange={handleChange}
              rows={5}
              placeholder="Share your thoughts..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Would you recommend us to a friend?
            </label>

            <div className="flex gap-4">
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className={`flex-1 cursor-pointer rounded-2xl border px-5 py-4 text-sm font-medium transition-all ${
                    formData.recommend === option
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-black"
                  }`}
                >
                  <input
                    type="radio"
                    name="recommend"
                    value={option}
                    checked={formData.recommend === option}
                    onChange={handleChange}
                    className="hidden"
                  />

                  <div className="text-center">{option}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-900 transition-colors text-white rounded-2xl py-4 text-sm font-semibold"
          >
            Submit Survey
          </button>
        </form>
      </div>
    </div>
  );
}