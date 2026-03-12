import { SUBJECT_AREAS } from "@/lib/countries";
import FormLayout from "@components/Auth/Contributor/Participant/FormLayout";
import { useFormContext } from "@context/FormContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function OrganizationType() {
  const { formData, updateFormData } = useFormContext();
  const [organizationType, setOrganizationType] = useState(
    formData.organizationType || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const filteredSubjects = SUBJECT_AREAS.filter(
    (subject) =>
      subject.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value: string, label: string) => {
    setOrganizationType(value);
    setSearchTerm(label);
    setIsDropdownOpen(false);
  };

  const handleSubmit = () => {
    if (organizationType) {
      updateFormData({ organizationType });
      navigate("/auth/sign-up/participant/register-name");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <FormLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Great! What kind of organization is it?
        </h1>

        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization type/Industry
          </label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search organization type..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />

          {isDropdownOpen && filteredSubjects.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject.value}
                  onClick={() => handleSelect(subject.value, subject.label)}
                  className="px-4 py-2 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {subject.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {subject.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleBack}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium hover:bg-gray-900 transition cursor-pointer"
          >
            Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={!organizationType}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium hover:bg-gray-900 cursor-pointer transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </FormLayout>
  );
}