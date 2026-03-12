import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { toast } from "react-hot-toast";
import { ENV } from "@/config/env";
import { useRegisterParticipantMutation } from "@/redux/api/slices/authSlice";


interface GoogleDecodedJWT {
  iss?: string;
  nbf?: number;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  azp?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  jti?: string;
}

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const [registerUser] = useRegisterParticipantMutation()

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
    
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
    
        const user = await res.json();
    
        const payload = {
          email: user.email,
          username: user.name,
          first_name: user.given_name,
          last_name: user.family_name,
          image: {
            imageUrl: user.picture,
            publicId: "",
          },
        };
    
        const response = registerUser({...payload, signupPlatform: "google"})
        console.log("Google user:", payload);
    
        // send payload to backend
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Google login failed");
      }
    },
    onError: () => {
      console.error("Google login failed");
      toast.error("Google login failed");
    },
    flow: "implicit", // or "auth-code"
  });

  return (
    <button
      onClick={() => login()}
      className="flex flex-1 items-center justify-center gap-2.5 px-5 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer"
    >
      <FcGoogle className="w-5 h-5" /> Continue with Google
    </button>
  );
};

const GoogleAuth = () => {
  const googleClientId = ENV.GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex gap-2.5 mb-2">
        <GoogleLoginButton />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;