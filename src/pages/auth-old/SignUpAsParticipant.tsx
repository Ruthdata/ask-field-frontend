import SignUpParticipantForm from '@components/Auth/Contributor/SignUpParticipantForm'
import React from 'react'

const SignUpAsParticipant = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        {/* Left: Sign Up Form */}
        <div className="flex-1 flex items-start justify-center py-12 px-6 lg:px-16 mt-20">
          <SignUpParticipantForm />
        </div>

        {/* Right: Image Panel */}
        <div className="hidden lg:block lg:w-[45%] xl:w-[40%] shrink-0 p-4">
          <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
            <img
              src="/images/shared/magnifying-glass.svg"
              alt="Magnifying glass over data"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpAsParticipant


















// import SignUpParticipantForm from '@components/Auth/Contributor/SignUpParticipantForm'
// import React from 'react'

// const SignUpAsParticipant = () => {
//   return (
//     <div>
//         <div className="flex mt-20 bg-gray-50">
//       {/* Left: Sign Up Form */}
//       <div className="flex-1 flex items-start justify-center py-12 px-6 lg:px-16">
//         <SignUpParticipantForm />
//       </div>

//       {/* Right: Image — hidden below lg */}
//       <div className="hidden lg:block lg:w-130 xl:w-150 shrink-0">
//         <div className="sticky top-0 h-screen overflow-hidden">
//           <img
//             src="/images/shared/magnifying-glass.svg"
//             alt="Magnifying glass over data"
//             width={588}
//             height={8800}
//             className="w-full object-cover object-left rounded-2xl"
//           />
//         </div>
//       </div>
//     </div>
//     </div>
//   )
// }

// export default SignUpAsParticipant