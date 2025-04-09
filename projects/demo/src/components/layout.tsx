import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="w-full flex">
      <div className="w-full my-4 mx-16 bg-grey flex flex-col flex-wrap gap-6">
        <Outlet />
      </div>
    </div>
  );
}
