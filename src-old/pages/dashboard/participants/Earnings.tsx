import EarningsDashboard from "@components/earnings/EarningDashboard";
import Finance from "@components/earnings/Finance";
import { useGetParticipantEarningsQuery } from "@/redux/api/walletApi";

const Earnings = () => {
  const { data, isLoading, isError } = useGetParticipantEarningsQuery();
  const earnings = data?.data;

  return (
    <div>
      <Finance currency={earnings?.currency} available={earnings?.available} completedStudies={earnings?.completedStudies} loading={isLoading} />
      {isError && <p className="mx-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">We couldn't load your earnings. Refresh the page to try again.</p>}
      <EarningsDashboard earnings={earnings} loading={isLoading} />
    </div>
  );
};

export default Earnings;
