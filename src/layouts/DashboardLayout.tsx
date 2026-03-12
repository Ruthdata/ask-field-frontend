import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {

  return (
    <div>
      <header>
        <button onClick={()=>{}}>Logout</button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
