import { useNavigate } from "react-router-dom";
import { clearAuthStorage } from "@/utils/token";
import { apiSlice } from "@/redux/api/slices/appSlice";
import { useDispatch } from "react-redux";

/** "Signed in as …" plus sign out, so a shared computer is easy to hand over. */
export default function SetupHeader({ name, email }: { name?: string; email?: string }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const signOut = () => {
    clearAuthStorage();
    dispatch(apiSlice.util.resetApiState());
    navigate("/", { replace: true });
  };
  return (
    <span className="who" style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", alignItems: "center", justifyContent: "flex-end" }}>
      {name && <span>Signed in as {name}{email ? ` · ${email}` : ""}</span>}
      <button type="button" className="linkbtn" onClick={signOut} style={{ fontSize: 14.5 }}>
        Sign out
      </button>
    </span>
  );
}
