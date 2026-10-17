import SignUpParticipantForm from "./SignUpParticipantForm";

export default function ContributorMgt() {
  return (
    <div className="flex mt-20 bg-gray-50">
      {/* Left: Sign Up Form */}
      <div className="flex-1 flex items-start justify-center py-12 px-6 lg:px-16">
        <SignUpParticipantForm />
      </div>

      {/* Right: Image — hidden below lg */}
      <div className="hidden lg:block lg:w-[520px] xl:w-[600px] shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden">
          <img
            src="/images/shared/magnifying-glass.svg"
            alt="Magnifying glass over data"
            className="w-full h-full object-cover object-left rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}