import FooterHome from '@components/footer/FooterHome';
import NavbarHome from '@components/navbar/NavbarHome';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div>
      <NavbarHome />
      <Outlet />
      <FooterHome />
    </div>
  );
}
